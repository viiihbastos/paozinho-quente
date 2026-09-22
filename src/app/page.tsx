import Link from "next/link";
import Header from "@/components/Header";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-bread-800 mb-4">
            Nunca mais chegue tarde demais
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Encontre padarias com pão quente saindo do forno agora. Reserve, assine e receba
            na hora certa — com agentes de IA que garantem o melhor match.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/mapa"
              className="bg-bread-500 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-bread-600 shadow-lg"
            >
              Ver Mapa
            </Link>
            <Link
              href="/cadastro"
              className="bg-white text-bread-600 px-8 py-3 rounded-xl text-lg font-medium border-2 border-bread-500 hover:bg-bread-50"
            >
              Criar Conta
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: "🗺️",
              title: "Mapa em Tempo Real",
              desc: "Veja padarias próximas com fornadas ativas e pão quente agora.",
            },
            {
              icon: "⏰",
              title: "Cronograma de Fornadas",
              desc: "Saiba exatamente quando o pão sai do forno em cada padaria.",
            },
            {
              icon: "📦",
              title: "Reserva + Pagamento",
              desc: "Garanta seu pão quente com pagamento antecipado na reserva.",
            },
            {
              icon: "🔄",
              title: "Assinaturas",
              desc: "Receba pão fresco todo dia com cashback de fidelidade.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-6 shadow border border-bread-100">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl p-8 shadow border border-bread-100">
          <h2 className="text-2xl font-bold text-bread-800 mb-6 text-center">
            Agentes de IA — Nossos Diferenciais
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "PCP Autônomo",
                desc: "Prevê quantidade de pães por fornada com base em assinaturas e histórico.",
              },
              {
                title: "Matchmaking Dinâmico",
                desc: "Encontra a padaria ideal com pão recém-saído do forno no seu raio.",
              },
              {
                title: "Otimização de Rotas",
                desc: "Agrupa entregas de assinantes por bairro para reduzir custo logístico.",
              },
              {
                title: "Retenção & Upsell",
                desc: "Notificações contextuais: 'Seu pão de queijo de sexta está quentinho!'",
              },
            ].map((a) => (
              <div key={a.title} className="flex gap-3">
                <span className="text-bread-500 text-xl">🤖</span>
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-gray-600 text-sm">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
