import { ForgotPasswordForm } from "./forgot-password-form";

export default async function EsqueciSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const params = await searchParams;

  return <ForgotPasswordForm invalidLink={params.erro === "link-invalido"} />;
}
