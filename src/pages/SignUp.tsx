import { SignupForm } from "@/components/auth/signup-form";

const SignUp = () => {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignUp;
