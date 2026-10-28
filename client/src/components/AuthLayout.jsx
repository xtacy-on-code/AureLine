import Logo from './Logo';
import Marker from './Marker';

// split screen for login/signup: form on the left, a comic panel quote on the right
function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="min-h-[100dvh] grid lg:grid-cols-[1fr_1fr]">
            <div className="flex flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10">
                <Logo />

                <main id="main" className="flex flex-1 items-center py-12">
                    <div className="rise-in mx-auto w-full max-w-sm">
                        <h1 className="font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-[-0.045em] text-ink">{title}</h1>
                        {subtitle && <p className="mt-3 text-base text-ink-soft">{subtitle}</p>}
                        <div className="mt-9">{children}</div>
                        {footer && <p className="mt-8 text-sm text-ink-soft">{footer}</p>}
                    </div>
                </main>
            </div>

            <aside className="relative hidden border-l-[2.5px] border-ink bg-paper-sunken/60 lg:flex lg:items-center lg:justify-center" aria-hidden="true">
                <div className="rise-in sketch relative w-[min(30rem,80%)] -rotate-[1.2deg] bg-paper-raised p-12 shadow-[var(--shadow-sheet)]" style={{ '--i': 2 }}>
                    <span className="absolute -top-4 left-8 -rotate-2 border-2 border-ink bg-mark-yellow px-3 py-0.5 font-hand text-lg uppercase tracking-[0.05em] text-ink">
                        Old proverb
                    </span>
                    <blockquote className="font-display text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-ink">
                        &ldquo;The{' '}
                        <Marker line animate delay={450} duration={850} className="marker-display">faintest ink</Marker>{' '}
                        is better than the best memory.&rdquo;
                    </blockquote>
                    <p className="mt-8 -rotate-1 font-hand text-2xl text-ink-soft">
                        &larr; which is why we highlight things
                    </p>
                </div>
            </aside>
        </div>
    );
}

export default AuthLayout;
