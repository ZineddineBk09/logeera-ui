import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const faqs = [
  {
    q: "How do I publish a trip?",
    a: "Go to Publish, fill in the steps, and submit. You'll see a success screen when done.",
  },
  {
    q: "How do requests work?",
    a: "Incoming requests appear in Requests → Incoming. You can accept or reject them.",
  },
  {
    q: "Is payment handled here?",
    a: "UI only for now. Pricing is shown as a placeholder without processing.",
  },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Find answers or contact us</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="space-y-2">
                <div className="font-medium">{f.q}</div>
                <p className="text-sm text-muted-foreground">{f.a}</p>
                {i < faqs.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Your name" />
            <Input placeholder="Email" type="email" />
            <Textarea placeholder="How can we help? (UI-only)" className="min-h-28" />
            <div className="flex justify-end">
              <Button>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


