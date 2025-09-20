import React from 'react';

const Loader = ({ fullScreen = false }: { fullScreen?: boolean }) => {
    if (fullScreen) {
        return (
            <div className="loader-overlay">
                <div className="loader"></div>
            </div>
        );
    }
    return <div className="loader"></div>;
};

export default Loader;
