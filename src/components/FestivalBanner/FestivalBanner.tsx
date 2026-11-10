import './FestivalBanner.css'

/**
 * Баннер главного мотофестиваля «В Одной Лодке».
 *
 * В основе — логотип `festival-banner-bg.png` (текст и фон) с вырезанной
 * лодкой в отдельном слое `festival-banner-boat.png`. Лодка накладывается
 * поверх фона и анимированно раскачивается, имитируя качку на воде.
 */
function FestivalBanner() {
  return (
    <section className="festival-banner" aria-label="Главный мотофестиваль — событие года">
      <div className="festival-banner__inner">
        <div className="festival-banner__logo-stage" aria-hidden="true">
          <img
            className="festival-banner__boat"
            src="/img/ВОднойЛодке.png"
            alt=""
            draggable={false}
          />
        </div>

        <div className="festival-banner__content">
          <span className="festival-banner__eyebrow">Мотофестиваль · В Одной Лодке</span>
          <h2 className="festival-banner__title">
            Главный мотофестиваль
            <span className="festival-banner__title-accent">событие 2027 года</span>
            ТОМСК
          </h2>
        </div>
      </div>
    </section>
  )
}

export default FestivalBanner
