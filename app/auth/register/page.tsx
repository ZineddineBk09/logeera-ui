import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Join RideShare</h1>
            <p className="text-muted-foreground">
              Create your account and start sharing rides
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent/10 via-background to-primary/10 items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-32 h-32 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-accent-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16 7C16 9.21 14.21 11 12 11C9.79 11 8 9.21 8 7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7ZM12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Join Our Community</h2>
            <p className="text-muted-foreground">
              Become part of a trusted network of travelers who prioritize
              safety, sustainability, and shared experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
