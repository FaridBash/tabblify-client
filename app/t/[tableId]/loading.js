import React from 'react';

export default function Loading() {
    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Hero Section Skeleton */}
            <div style={{ 
                height: '30dvh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%' 
            }}>
                <div className="skeleton" style={{ 
                    width: '110px', 
                    height: '110px', 
                    borderRadius: '50%' 
                }} />
            </div>

            {/* List Section Skeleton */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px', 
                width: '90%', 
                maxWidth: '450px', 
                margin: '0 auto' 
            }}>
                {[1, 2, 3, 4].map((i) => (
                    <div 
                        key={i} 
                        className="skeleton" 
                        style={{ 
                            height: '75px', 
                            width: '100%', 
                            borderRadius: '50px' 
                        }} 
                    />
                ))}
            </div>
        </div>
    );
}
