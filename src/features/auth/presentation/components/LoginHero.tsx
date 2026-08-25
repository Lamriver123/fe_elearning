import loginHero from '../../../../assets/login-hero.jpg'

export function LoginHero() {
  return (
    <aside className="login-hero" aria-label="E-learning">
      <img className="login-hero__image" src={loginHero} alt="E-learning" />
      <div className="login-hero__shade" aria-hidden="true" />
      <div className="login-hero__content">
        <p className="login-hero__eyebrow">E-learning Platform</p>
        <h2 className="login-hero__title">Học tập mỗi ngày, <br /> tiến bộ mỗi ngày.</h2>
      </div>
    </aside>
  )
}
