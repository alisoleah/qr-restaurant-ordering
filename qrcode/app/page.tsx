'use client';

import Link from 'next/link';
import styles from './landing.module.css';

export default function LandingPage() {
  return (
    <div className={styles.body}>
      <div className={`${styles.shape} ${styles.shapeLeft}`}></div>
      <div className={`${styles.shape} ${styles.shapeRight}`}></div>

      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerContent}`}>
          <Link href="/" className={styles.logoLink}>
            <img src="/logo2.png" alt="Restaurant Logo" className={styles.logoImg} />
          </Link>
          <nav className={styles.nav}>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#restaurants">For Restaurants</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </nav>
          <Link href="/demo" className={`${styles.btn} ${styles.btnPrimary}`}>
            Get Started
          </Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroContent}`}>
            <div className={styles.heroText}>
              <h1>Split Bills.<br />No Drama.</h1>
              <p>Splytro makes splitting restaurant checks fast, fair, and hassle-free for everyone.</p>
              <Link href="/demo" className={`${styles.btn} ${styles.btnLarge} ${styles.btnPrimary}`}>
                Get Started for Free
              </Link>
            </div>
            <div className={styles.heroImage}>
              <img
                src="https://images.unsplash.com/photo-1556742208-999815fca738?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                alt="Friends splitting bills with phones at a restaurant"
              />
            </div>
          </div>
        </section>

        <section id="features" className={styles.features}>
          <div className={styles.container}>
            <h2>Why Splytro?</h2>
            <div className={styles.grid3}>
              <div className={styles.featureCard}>
                <div className={`${styles.iconWrapper} ${styles.teal}`}>
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <h3>Instant Splitting</h3>
                <p>Instant splitting restaurant checks fast, fair, and hassle-free for everyone.</p>
              </div>
              <div className={styles.featureCard}>
                <div className={`${styles.iconWrapper} ${styles.coral}`}>
                  <i className="fa-solid fa-credit-card"></i>
                </div>
                <h3>Pay Your Way</h3>
                <p>Pay your portion with your credit cards and don't wait to pay your way.</p>
              </div>
              <div className={styles.featureCard}>
                <div className={`${styles.iconWrapper} ${styles.teal}`}>
                  <i className="fa-solid fa-store"></i>
                </div>
                <h3>Seamless Integration</h3>
                <p>Restaurant integration brings more information to you and smooths your dining experience.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.howItWorks}>
          <div className={styles.container}>
            <h2>How It Works</h2>
            <div className={styles.grid3}>
              <div className={styles.stepCard}>
                <h3>1. Scan Bill</h3>
                <div className={styles.stepIcon}>
                  <i className="fa-solid fa-receipt"></i>
                </div>
              </div>
              <div className={styles.stepCard}>
                <h3>2. Select Items/Split Evenly</h3>
                <div className={styles.stepIcon}>
                  <i className="fa-solid fa-list-check"></i>
                </div>
              </div>
              <div className={styles.stepCard}>
                <h3>3. Pay & Go</h3>
                <div className={styles.stepIcon}>
                  <i className="fa-solid fa-mobile-screen-button"></i>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <Link href="/" className={styles.logoLink}>
            <img src="/logo2.png" alt="Restaurant Logo" className={styles.logoImg} />
          </Link>
          <p>© 2025 Splytro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
