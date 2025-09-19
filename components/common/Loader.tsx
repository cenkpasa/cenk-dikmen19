import React from 'react';

const Loader = ({ fullScreen = false, size }: { fullScreen?: boolean; size?: 'sm' | 'md' }) => {
    const loader = (
        // Fix: Conditionally set minHeight to avoid breaking layout for small loaders.
        <div style={{ display: 'grid', placeItems: 'center', minHeight: size === 'sm' ? undefined : 200 }}>
            <div className="animate-pulse">Yükleniyor...</div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="loader-overlay fixed inset-0 z-[10002] flex items-center justify-center bg-white/80">
                {loader}
            </div>
        );
    }
    
    return loader;
};

export default Loader;