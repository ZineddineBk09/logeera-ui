import { prisma } from '@/lib/database';

export interface CreateNotificationData {
  type: 'CHAT_MESSAGE' | 'REQUEST_SENT' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'REQUEST_CANCELLED' | 'REQUEST_IN_TRANSIT' | 'REQUEST_DELIVERED' | 'REQUEST_COMPLETED' | 'RATING_REQUIRED';
  title: string;
  message: string;
  userId: string; // User who receives the notification
  fromUserId: string; // User who triggered the notification
  tripId?: string;
  requestId?: string;
  chatId?: string;
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          userId: data.userId,
          fromUserId: data.fromUserId,
          tripId: data.tripId,
          requestId: data.requestId,
          chatId: data.chatId,
        },
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async createChatMessageNotification(
    chatId: string,
    senderId: string,
    receiverId: string,
    messageContent: string
  ) {
    // Get chat details
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        userA: { select: { name: true } },
        userB: { select: { name: true } },
        trip: { select: { originName: true, destinationName: true } },
      },
    });

    if (!chat) return;

    const senderName = chat.userAId === senderId ? chat.userA.name : chat.userB.name;
    const tripInfo = chat.trip ? ` (${chat.trip.originName} → ${chat.trip.destinationName})` : '';

    return this.createNotification({
      type: 'CHAT_MESSAGE',
      title: 'New Message',
      message: `${senderName} sent you a message${tripInfo}`,
      userId: receiverId,
      fromUserId: senderId,
      chatId: chatId,
      tripId: chat.tripId || undefined,
    });
  }

  static async createRequestNotification(
    type: 'REQUEST_SENT' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'REQUEST_CANCELLED' | 'REQUEST_IN_TRANSIT' | 'REQUEST_DELIVERED' | 'REQUEST_COMPLETED',
    requestId: string,
    recipientId: string,
    senderId: string
  ) {
    // Get request details
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        trip: { select: { originName: true, destinationName: true, payloadType: true } },
        applicant: { select: { name: true } },
      },
    });

    if (!request) return;

    const tripInfo = `${request.trip.originName} → ${request.trip.destinationName}`;
    const isParcel = request.trip.payloadType === 'PARCEL';
    const applicantName = request.applicant.name;

    let title = '';
    let message = '';

    switch (type) {
      case 'REQUEST_SENT':
        title = 'New Request';
        message = `${applicantName} requested to ${isParcel ? 'use your delivery service' : 'join your trip'} for ${tripInfo}`;
        break;
      case 'REQUEST_ACCEPTED':
        title = 'Request Accepted';
        message = `Your request to ${isParcel ? 'use the delivery service' : 'join the trip'} for ${tripInfo} has been accepted`;
        break;
      case 'REQUEST_REJECTED':
        title = 'Request Rejected';
        message = `Your request to ${isParcel ? 'use the delivery service' : 'join the trip'} for ${tripInfo} has been rejected`;
        break;
      case 'REQUEST_CANCELLED':
        title = 'Request Cancelled';
        message = `The request for ${tripInfo} has been cancelled`;
        break;
      case 'REQUEST_IN_TRANSIT':
        title = isParcel ? 'Parcel Received' : 'Passenger Onboard';
        message = `${isParcel ? 'Your parcel has been received' : 'You are now onboard'} for ${tripInfo}`;
        break;
      case 'REQUEST_DELIVERED':
        title = isParcel ? 'Parcel Delivered' : 'Arrived at Destination';
        message = `${isParcel ? 'Your parcel has been delivered' : 'You have arrived at your destination'} for ${tripInfo}`;
        break;
      case 'REQUEST_COMPLETED':
        title = 'Trip Completed';
        message = `Your ${isParcel ? 'delivery' : 'trip'} for ${tripInfo} has been completed`;
        break;
    }

    return this.createNotification({
      type,
      title,
      message,
      userId: recipientId,
      fromUserId: senderId,
      requestId: requestId,
      tripId: request.tripId,
    });
  }

  static async createRatingNotification(
    tripId: string,
    requestId: string,
    applicantId: string,
    publisherId: string
  ) {
    // Get trip and request details
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        trip: { 
          select: { 
            originName: true, 
            destinationName: true, 
            payloadType: true,
          } 
        },
      },
    });

    if (!request) return;

    const tripInfo = `${request.trip.originName} → ${request.trip.destinationName}`;
    const isParcel = request.trip.payloadType === 'PARCEL';

    return this.createNotification({
      type: 'RATING_REQUIRED',
      title: 'Rate Your Experience',
      message: `Please rate your ${isParcel ? 'delivery experience' : 'trip'} for ${tripInfo}`,
      userId: applicantId,
      fromUserId: publisherId,
      requestId: requestId,
      tripId: tripId,
    });
  }
}
