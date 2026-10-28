import Logo from './Logo';

// top bar for the signed-in app: wordmark left, actions right
function AppBar({ children, wide = false }) {
    return (
        <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-[2px] border-b border-rule pt-[env(safe-area-inset-top)]">
            <div className={`mx-auto ${wide ? 'max-w-[1400px]' : 'max-w-6xl'} h-16 px-4 sm:px-6 flex items-center justify-between gap-4`}>
                <Logo to="/dashboard" />
                <div className="flex items-center gap-2">{children}</div>
            </div>
        </header>
    );
}

export default AppBar;
