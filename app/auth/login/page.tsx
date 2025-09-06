import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to your RideShare account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-background to-accent/10 items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-32 h-32 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Start Your Journey</h2>
            <p className="text-muted-foreground">
              Connect with trusted drivers and travelers. Share rides, split
              costs, and travel sustainably.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
