import { Component } from "react";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="app-error-screen">
        <div className="app-error-card">
          <p className="section-kicker">Аль-Ильм</p>
          <h1>Страница не загрузилась</h1>
          <p>Обнови страницу или вернись на главную. Мы уже защищаем приложение от пустого экрана.</p>
          <div className="app-error-actions">
            <button className="button button--primary" type="button" onClick={() => window.location.reload()}>
              Обновить
            </button>
            <button className="button button--soft" type="button" onClick={() => window.location.assign("/home")}>
              На главную
            </button>
          </div>
        </div>
      </section>
    );
  }
}
