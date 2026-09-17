import { AuthForm } from "@/components/auth-form";
import { requestReset } from "@/app/(auth)/actions";
export default function ForgotPage() { return <AuthForm action={requestReset} mode="forgot" />; }
