import { ArrowRight, GithubLogo } from '@phosphor-icons/react';
import { useAuth } from '../context/auth';
import Logo from '../components/Logo';
import Button from '../components/Button';
import Marker from '../components/Marker';
import HeroStrip from '../components/landing/HeroStrip';
import ScrollStory from '../components/landing/ScrollStory';
import TryItLive from '../components/landing/TryItLive';
import BeforeAfter from '../components/landing/BeforeAfter';
import PageFan from '../components/landing/PageFan';
import ScrollCue from '../components/landing/ScrollCue';

function Landing() {
    const { token } = useAuth();
    const startTo = token ? '/upload' : '/signup';

    return (
        <div className="relative min-h-[100dvh] overflow-x-clip">
            <ScrollCue />
            <header className="pt-[env(safe-area-inset-top)]">
                <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Logo />
                    <div className="flex items-center gap-1 sm:gap-2">
                        {token ? (
                            <Button to="/dashboard" size="sm">Open library</Button>
                        ) : (
                            <>
                                <Button to="/login" variant="ghost" size="sm">Log in</Button>
                                <Button to="/signup" size="sm">Get started</Button>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main id="main">
                <HeroStrip startTo={startTo} />
                <ScrollStory />
                <TryItLive startTo={startTo} />
                <BeforeAfter />
                <PageFan />

                {/* last panel */}
                <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 md:pb-32">
                    <div className="sketch relative bg-mark-yellow/70 px-6 py-14 shadow-[var(--shadow-sheet)] sm:px-12 md:py-20">
                        <span className="caption-box bg-white">The end (of rereading)</span>
                        <h2 className="mt-6 max-w-[14ch] font-display text-[clamp(2.8rem,7vw,5.4rem)] font-extrabold leading-[0.88] tracking-[-0.05em] text-ink">
                            Stop rereading.{' '}
                            <Marker line animate duration={850} tone="green" className="marker-display">Start remembering.</Marker>
                        </h2>
                        <div className="mt-10 flex flex-wrap items-center gap-5">
                            <Button to={startTo} size="lg">
                                Highlight your first PDF
                                <ArrowRight size={18} weight="bold" aria-hidden="true" />
                            </Button>
                            <span className="font-hand text-2xl text-ink">no card, no setup, just a PDF</span>
                        </div>
                        <span className="sfx absolute right-6 top-6 hidden text-[3rem] sm:block" data-play="true" style={{ '--sfx-rotate': '10deg' }} aria-hidden="true">
                            fin.
                        </span>
                    </div>
                </section>
            </main>

            <footer className="border-t-[2.5px] border-ink pb-[env(safe-area-inset-bottom)]">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
                    <Logo />
                    <div className="flex items-center gap-5 text-sm text-ink-soft">
                        <span className="font-hand text-xl">drawn by Vedant</span>
                        <a
                            href="https://github.com/xtacy-on-code/AureLine"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 font-semibold hover-fine:text-ink"
                        >
                            <GithubLogo size={18} aria-hidden="true" />
                            Source
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
