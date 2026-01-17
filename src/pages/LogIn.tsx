import { LoginForm } from "@/components/auth/login-form";

const LogIn = () => {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
};

export default LogIn;
