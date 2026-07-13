import { RequestForm } from "../components/request-form";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="request-card" aria-labelledby="page-title">
        <header className="page-header">
          <h1 id="page-title">Заявка в УО</h1>
          <p>Опишите как есть — получите готовую заявку</p>
        </header>

        <RequestForm />
      </section>
    </main>
  );
}
