import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedOwner } from "@/lib/authorized-email";

// Rotas acessíveis sem sessão autenticada.
const PUBLIC_ROUTES = ["/login", "/reset-password"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));

  // Sessão autenticada, mas de um e-mail diferente do proprietário configurado
  // em AUTHORIZED_EMAIL: encerra a sessão imediatamente, em qualquer rota.
  if (user && !isAuthorizedOwner(user.email)) {
    await supabase.auth.signOut();
    if (path !== "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    // Rede de segurança: um link de recuperação de senha no formato "code"
    // (PKCE) chega como ?code=... em vez de #access_token=... — se cair aqui
    // sem sessão, é isso, então manda pra /reset-password com o code junto,
    // em vez de simplesmente jogar pro login e perder o link.
    if (request.nextUrl.searchParams.has("code")) {
      url.pathname = "/reset-password";
    } else {
      url.pathname = "/login";
    }
    return NextResponse.redirect(url);
  }

  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
