export default function Loading() {
    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Skeleton for Header Title (when in category/items) */}
            <div className="skeleton" style={{ height: '30px', width: '60%', margin: '0 auto', borderRadius: '8px' }} />

            {/* Skeleton Items */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton" style={{ height: '100px', width: '100%', borderRadius: '20px' }} />
                ))}
            </div>
        </div>
    );
}
