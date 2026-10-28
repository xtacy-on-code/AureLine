import Logo from './Logo';
import Marker from './Marker';

// split screen for login/signup: form on the left, a paper quote on the right
function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="min-h-[100dvh] grid lg:grid-cols-[1fr_1fr]">
            <div className="flex flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10">
                <Logo />

                <main className="flex flex-1 items-center py-12">
                    <div className="rise-in mx-auto w-full max-w-sm">
                        <h1 className="font-serif text-[2.75rem] leading-none tracking-tight text-ink">{title}</h1>
                        {subtitle && <p className="mt-3 text-base text-ink-soft">{subtitle}</p>}
                        <div className="mt-9">{children}</div>
                        {footer && <p className="mt-8 text-sm text-ink-soft">{footer}</p>}
                    </div>
                </main>
            </div>

            <aside className="relative hidden overflow-hidden border-l border-rule bg-paper-sunken lg:flex lg:items-center lg:justify-center" aria-hidden="true">
                <div className="rise-in w-[min(30rem,80%)] -rotate-[1.5deg] rounded-[var(--radius-sheet)] border border-rule bg-paper-raised p-12 shadow-[var(--shadow-sheet)]" style={{ '--i': 2 }}>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">Proverb</p>
                    <blockquote className="mt-6 font-serif text-[2.6rem] leading-[1.08] tracking-tight text-ink">
                        &ldquo;The{' '}
                        <Marker line animate delay={450} duration={850} className="marker-display italic">faintest ink</Marker>{' '}
                        is better than the best memory.&rdquo;
                    </blockquote>
                    <div className="mt-10 space-y-2.5">
                        {[100, 88, 94, 58].map((w, i) => (
                            <div key={i} className="h-2 rounded-full bg-paper-sunken" style={{ width: `${w}%` }} />
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default AuthLayout;
