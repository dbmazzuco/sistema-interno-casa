import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ cadastro?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <LoginForm signupSent={params.cadastro === "enviado"} />
    </div>
  );
}
