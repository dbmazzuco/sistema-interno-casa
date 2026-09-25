import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ cadastro?: string; senha?: string }>;
}) {
  const params = await searchParams;

  return (
    <LoginForm
      signupSent={params.cadastro === "enviado"}
      passwordReset={params.senha === "redefinida"}
    />
  );
}
