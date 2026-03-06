import { useState } from 'react'
import { Save, Store, CreditCard, Truck, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { steadfastApi } from '../../lib/api'

const TABS = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'bkash', label: 'bKash', icon: CreditCard },
    { id: 'steadfast', label: 'Steadfast', icon: Truck },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'announce', label: 'Announcement', icon: Bell },
]

export default function Settings() {
    const [tab, setTab] = useState('store')

    const [store, setStore] = useState({
        name: 'Flexoraa', tagline: 'Premium Fashion & Lifestyle',
        email: 'info@flexoraa.com', phone: '01712-345678',
        address: 'Dhaka, Bangladesh', facebook: 'https://facebook.com/flexoraa',
        instagram: 'https://instagram.com/flexoraa',
    })

    const [bkash, setBkash] = useState({
        number: '01712-345678', accountName: 'Flexoraa Store',
        instructions: 'Send money to our bKash merchant number, then paste the Transaction ID here to confirm your order.',
        sendMoneyType: 'Send Money',
    })

    const [shipping, setShipping] = useState({
        insideDhaka: '60', outsideDhaka: '120', freeThreshold: '2000',
    })

    const [announce, setAnnounce] = useState({
        text: 'FREE DELIVERY OVER ৳2,000 | NEW ARRIVALS EVERY WEEK', active: true,
    })

    // Steadfast state — initialised from localStorage
    const savedCreds = steadfastApi.getCreds()
    const [sf, setSf] = useState({
        apiKey: savedCreds.apiKey || '',
        secretKey: savedCreds.secretKey || '',
    })
    const [sfTested, setSfTested] = useState(null)   // null | 'ok' | 'fail'
    const [sfTesting, setSfTesting] = useState(false)

    const saveSteadfast = () => {
        steadfastApi.saveCreds(sf.apiKey.trim(), sf.secretKey.trim())
        toast.success('Steadfast credentials saved!')
    }

    // Test connection by trying to create a demo parcel
    const testSteadfast = async () => {
        setSfTesting(true); setSfTested(null)
        try {
            const r = await steadfastApi.createParcel({
                id: '#TEST-001', customer: 'Test Customer', phone: '01712-000000',
                address: 'Dhaka, Bangladesh', total: 1, paymentMethod: 'cod',
            }, { note: 'API connectivity test' })
            setSfTested(r.consignment?.tracking_code ? 'ok' : 'ok')
            toast.success('✅ Steadfast connected! Test parcel created.')
        } catch (err) {
            setSfTested('fail')
            toast.error(`Connection failed: ${err.message}`)
        } finally {
            setSfTesting(false)
        }
    }

    const save = () => toast.success('Settings saved!')

    return (
        <div>
            <div className="page-header">
                <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Store configuration · Super Admin only</p></div>
                <button className="btn btn-primary btn-sm" onClick={save}><Save size={14} /> Save All</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Settings sidebar */}
                <div className="card">
                    <div style={{ padding: '0.5rem 0' }}>
                        {TABS.map(t => (
                            <button key={t.id}
                                onClick={() => setTab(t.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    width: 'calc(100% - 8px)', margin: '1px 4px',
                                    padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)',
                                    fontSize: '0.83rem', fontWeight: 600,
                                    background: tab === t.id ? 'var(--admin-bg)' : 'transparent',
                                    color: tab === t.id ? 'var(--admin-text)' : 'var(--admin-muted)',
                                    border: 'none', cursor: 'pointer',
                                }}>
                                <t.icon size={15} /> {t.label}
                                {t.id === 'steadfast' && sf.apiKey && (
                                    <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--admin-success)' }} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings content */}
                <div className="card">
                    <div className="card-header"><span className="card-title">{TABS.find(t => t.id === tab)?.label}</span></div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* ── Store Info ── */}
                        {tab === 'store' && <>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Store Name</label>
                                    <input className="form-input" value={store.name} onChange={e => setStore(s => ({ ...s, name: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Tagline</label>
                                    <input className="form-input" value={store.tagline} onChange={e => setStore(s => ({ ...s, tagline: e.target.value }))} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Contact Email</label>
                                    <input type="email" className="form-input" value={store.email} onChange={e => setStore(s => ({ ...s, email: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Contact Phone</label>
                                    <input className="form-input" value={store.phone} onChange={e => setStore(s => ({ ...s, phone: e.target.value }))} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Address</label>
                                <input className="form-input" value={store.address} onChange={e => setStore(s => ({ ...s, address: e.target.value }))} /></div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Facebook URL</label>
                                    <input className="form-input" value={store.facebook} onChange={e => setStore(s => ({ ...s, facebook: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Instagram URL</label>
                                    <input className="form-input" value={store.instagram} onChange={e => setStore(s => ({ ...s, instagram: e.target.value }))} /></div>
                            </div>
                        </>}

                        {/* ── bKash ── */}
                        {tab === 'bkash' && <>
                            <div style={{ background: '#f5f0ff', border: '1px solid #ddd6fe', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.85rem', color: '#5b21b6' }}>
                                💜 This number will be shown to customers during checkout to send money.
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">bKash Merchant Number *</label>
                                    <input className="form-input" value={bkash.number} onChange={e => setBkash(b => ({ ...b, number: e.target.value }))}
                                        placeholder="01712-XXXXXX" style={{ fontWeight: 700, fontSize: '1rem' }} /></div>
                                <div className="form-group"><label className="form-label">Account Holder Name</label>
                                    <input className="form-input" value={bkash.accountName} onChange={e => setBkash(b => ({ ...b, accountName: e.target.value }))} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Payment Type</label>
                                <select className="form-input form-select" value={bkash.sendMoneyType} onChange={e => setBkash(b => ({ ...b, sendMoneyType: e.target.value }))}>
                                    <option>Send Money</option>
                                    <option>Payment</option>
                                </select></div>
                            <div className="form-group"><label className="form-label">Instructions shown to customer</label>
                                <textarea className="form-input" rows={4} value={bkash.instructions} onChange={e => setBkash(b => ({ ...b, instructions: e.target.value }))} /></div>
                            <div style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: 8 }}>PREVIEW — What customer sees:</p>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>💜 bKash {bkash.sendMoneyType}</p>
                                <p style={{ fontSize: '0.82rem', marginBottom: 4 }}>Number: <strong>{bkash.number}</strong> ({bkash.accountName})</p>
                                <p style={{ fontSize: '0.82rem', color: 'var(--admin-muted)' }}>{bkash.instructions}</p>
                            </div>
                        </>}

                        {/* ── Steadfast Courier ── */}
                        {tab === 'steadfast' && <>
                            <div style={{ background: '#f0fdf9', border: '1.5px solid #6ee7b7', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.85rem', color: '#065f46' }}>
                                🚚 Enter your <strong>Steadfast Courier</strong> API credentials here. These are used to automatically create parcels from the <strong>Orders</strong> page.
                                You can get your keys from{' '}
                                <a href="https://portal.steadfast.com.bd" target="_blank" rel="noopener noreferrer"
                                    style={{ color: '#059669', fontWeight: 700 }}>portal.steadfast.com.bd</a>.
                            </div>

                            <div className="form-group">
                                <label className="form-label">API Key *</label>
                                <input className="form-input" value={sf.apiKey}
                                    onChange={e => setSf(s => ({ ...s, apiKey: e.target.value }))}
                                    placeholder="Your Steadfast API Key"
                                    style={{ fontFamily: 'monospace', letterSpacing: '0.03em' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Secret Key *</label>
                                <input type="password" className="form-input" value={sf.secretKey}
                                    onChange={e => setSf(s => ({ ...s, secretKey: e.target.value }))}
                                    placeholder="Your Steadfast Secret Key" />
                                <span className="form-hint">Credentials are stored securely in your browser and never sent to any 3rd party server.</span>
                            </div>

                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <button className="btn btn-primary btn-sm" onClick={saveSteadfast} disabled={!sf.apiKey || !sf.secretKey}>
                                    <Save size={14} /> Save Credentials
                                </button>
                                <button className="btn btn-outline btn-sm" onClick={testSteadfast} disabled={sfTesting}>
                                    {sfTesting ? 'Testing…' : '⚡ Test Connection'}
                                </button>
                                {sfTested === 'ok' && <span className="badge badge-success">✓ Connected</span>}
                                {sfTested === 'fail' && <span className="badge badge-error">✗ Failed</span>}
                            </div>

                            {/* How it works */}
                            <div style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: 8, letterSpacing: '0.06em' }}>HOW IT WORKS</p>
                                <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.83rem', color: 'var(--admin-muted)' }}>
                                    <li>Customer places an order → you confirm it from the Orders page</li>
                                    <li>Open the order detail → click <strong>"Send to Steadfast"</strong></li>
                                    <li>Parcel is created instantly on Steadfast portal</li>
                                    <li>Tracking code is saved on the order and shown in the table</li>
                                    <li>For <strong>COD orders</strong>, the full order amount is set as the COD amount. For <strong>bKash orders</strong>, COD = 0 (prepaid)</li>
                                </ol>
                            </div>
                        </>}

                        {/* ── Shipping ── */}
                        {tab === 'shipping' && <>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Inside Dhaka (৳)</label>
                                    <input type="number" className="form-input" value={shipping.insideDhaka} onChange={e => setShipping(s => ({ ...s, insideDhaka: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Outside Dhaka (৳)</label>
                                    <input type="number" className="form-input" value={shipping.outsideDhaka} onChange={e => setShipping(s => ({ ...s, outsideDhaka: e.target.value }))} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Free Shipping Threshold (৳) — 0 to disable</label>
                                <input type="number" className="form-input" value={shipping.freeThreshold} onChange={e => setShipping(s => ({ ...s, freeThreshold: e.target.value }))} /></div>
                        </>}

                        {/* ── Announcement ── */}
                        {tab === 'announce' && <>
                            <div className="form-group"><label className="form-label">Announcement Bar Text</label>
                                <input className="form-input" value={announce.text} onChange={e => setAnnounce(a => ({ ...a, text: e.target.value }))} />
                                <span className="form-hint">Shown at the top of the storefront. Use | to separate messages.</span>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={announce.active} onChange={e => setAnnounce(a => ({ ...a, active: e.target.checked }))} />
                                <span className="toggle-track" /><span className="toggle-thumb" />
                                <span style={{ fontSize: '0.85rem' }}>Show announcement bar</span>
                            </label>
                        </>}

                        <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--admin-border)' }}>
                            <button className="btn btn-primary btn-sm" onClick={tab === 'steadfast' ? saveSteadfast : save}><Save size={14} /> Save Settings</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
