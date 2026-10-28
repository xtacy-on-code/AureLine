import { ArrowRight, GithubLogo } from '@phosphor-icons/react';
import { useAuth } from '../context/auth';
import Logo from '../components/Logo';
import Button from '../components/Button';
import Marker from '../components/Marker';
import HeroSheet from '../components/landing/HeroSheet';

const STEPS = [
    {
        title: 'Drop in a PDF',
        body: <>Lecture notes, a research paper, a contract, a chapter you have to read by Monday. <Marker line animate tone="yellow">Up to 4 MB.</Marker></>,
    },
    {
        title: 'It reads every page',
        body: <>AureLine pulls the text from each page and picks <Marker line animate tone="blue">up to ten passages worth keeping</Marker>, spread across the whole document.</>,
    },
    {
        title: 'Marks land on the exact words',
        body: <>Highlights are drawn on your original PDF, <Marker line animate tone="green">on the words themselves</Marker>, not in a summary off to the side. Download it, or come back to it from your library.</>,
    },
];

const PENS = [
    {
        tone: 'yellow',
        name: 'Definitions',
        note: 'A term and what it means.',
        example: <>A <Marker line animate tone="yellow">mitochondrion is the organelle that produces most of the cell's ATP</Marker>, which is why muscle cells are packed with them.</>,
    },
    {
        tone: 'blue',
        name: 'Key concepts',
        note: 'The ideas the rest of the text hangs on.',
        example: <>Darwin's argument rests on <Marker line animate tone="blue">natural selection acting on inherited variation</Marker> over many generations.</>,
    },
    {
        tone: 'green',
        name: 'Important points',
        note: 'Facts, rules and results worth remembering.',
        example: <>Under the new policy, <Marker line animate tone="green">refunds must be requested within 14 days of delivery</Marker>; after that only store credit is offered.</>,
    },
];

function Landing() {
    const { token } = useAuth();
    const startTo = token ? '/upload' : '/signup';

    return (
        <div className="min-h-[100dvh] overflow-x-clip">
            {/* nav */}
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
                {/* hero */}
                <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-8 sm:px-6 md:pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pb-32">
                    <div>
                        <p className="rise-in font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
                            AI highlighter for PDFs
                        </p>

                        <h1 className="rise-in mt-6 font-serif text-[clamp(3.4rem,9vw,6.4rem)] leading-[0.9] tracking-[-0.02em] text-ink" style={{ '--i': 1 }}>
                            Read less.
                            <br />
                            <Marker line animate delay={500} duration={900} className="marker-display italic">Remember more.</Marker>
                        </h1>

                        <p className="rise-in mt-8 max-w-[34rem] text-lg leading-relaxed text-ink-soft" style={{ '--i': 2 }}>
                            Drop in a PDF. AureLine reads every page and marks the definitions, key concepts and
                            important points right on the page, then hands you the highlighted file.
                        </p>

                        <div className="rise-in mt-10 flex flex-wrap items-center gap-3" style={{ '--i': 3 }}>
                            <Button to={startTo} size="lg">
                                Highlight a PDF
                                <ArrowRight size={18} weight="bold" aria-hidden="true" />
                            </Button>
                            <Button href="#how" variant="ghost" size="lg">
                                How it works
                            </Button>
                        </div>

                        <p className="rise-in mt-6 font-mono text-xs text-ink-faint" style={{ '--i': 4 }}>
                            Free &middot; PDFs up to 4 MB &middot; Your files stay private
                        </p>
                    </div>

                    <div className="rise-in" style={{ '--i': 2 }}>
                        <HeroSheet />
                    </div>
                </section>

                {/* how it works */}
                <section id="how" className="scroll-mt-8 border-t border-rule">
                    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-20 md:py-32">
                        <div className="md:sticky md:top-24 md:self-start">
                            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">How it works</p>
                            <h2 className="mt-5 font-serif text-[clamp(2.6rem,5.5vw,4.2rem)] leading-[0.95] tracking-tight text-ink">
                                Three steps,
                                <br />
                                <span className="italic">about ten seconds.</span>
                            </h2>
                        </div>

                        <ol className="divide-y divide-rule border-y border-rule">
                            {STEPS.map((step, i) => (
                                <li key={step.title} className="grid grid-cols-[3.5rem_1fr] gap-x-4 py-9 sm:grid-cols-[5rem_1fr]">
                                    <span className="font-mono text-sm tabular-nums text-ink-faint pt-1.5">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h3 className="text-2xl font-medium tracking-tight text-ink">{step.title}</h3>
                                        <p className="mt-3 max-w-[38rem] text-base leading-relaxed text-ink-soft">{step.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* the three pens */}
                <section className="bg-paper-raised border-y border-rule">
                    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
                        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
                            <h2 className="font-serif text-[clamp(2.6rem,5.5vw,4.2rem)] leading-[0.95] tracking-tight text-ink">
                                Every colour
                                <br />
                                <span className="italic">means something.</span>
                            </h2>
                            <p className="max-w-[28rem] text-base leading-relaxed text-ink-soft md:justify-self-end">
                                Three pens, used the same way every time, so a glance at the page tells you what kind
                                of thing you are looking at.
                            </p>
                        </div>

                        <div className="mt-16 divide-y divide-rule border-y border-rule">
                            {PENS.map(pen => (
                                <div key={pen.name} className="grid gap-4 py-10 md:grid-cols-[16rem_1fr] md:gap-12">
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1.5 h-3.5 w-8 shrink-0 rounded-[3px] mix-blend-multiply" style={{ background: `var(--color-mark-${pen.tone})` }} aria-hidden="true" />
                                        <div>
                                            <h3 className="text-lg font-medium text-ink">{pen.name}</h3>
                                            <p className="mt-1 text-sm text-ink-faint">{pen.note}</p>
                                        </div>
                                    </div>
                                    <p className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.35] text-ink-soft">
                                        {pen.example}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* closing call to action */}
                <section className="mx-auto max-w-6xl px-4 py-28 sm:px-6 md:py-40">
                    <h2 className="max-w-[14ch] font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.92] tracking-[-0.02em] text-ink">
                        Stop rereading.{' '}
                        <Marker line animate duration={900} tone="green" className="marker-display italic">Start remembering.</Marker>
                    </h2>
                    <div className="mt-12 flex flex-wrap items-center gap-4">
                        <Button to={startTo} size="lg">
                            Highlight your first PDF
                            <ArrowRight size={18} weight="bold" aria-hidden="true" />
                        </Button>
                        <span className="text-sm text-ink-faint">No card, no setup. Just a PDF.</span>
                    </div>
                </section>
            </main>

            <footer className="border-t border-rule pb-[env(safe-area-inset-bottom)]">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
                    <Logo />
                    <div className="flex items-center gap-5 text-sm text-ink-faint">
                        <span>Built by Vedant</span>
                        <a
                            href="https://github.com/xtacy-on-code/AureLine"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 hover-fine:text-ink"
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
