'use client';

import { useMemo, useState } from 'react';
import { Alert, Button, Card, Empty, Input, Modal, notification, Tag } from 'antd';
import { ArrowRightOutlined, CheckCircleFilled, MinusOutlined, PlusOutlined, ShoppingOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { isSupabaseConfigured, placeCustomerOrder, sendPhoneOtp, verifyPhoneOtp } from '@/services/supabaseAuth';

const dishes = [
  { id: 'd1', name: 'Truffle forest risotto', category: 'From the kitchen', detail: 'Carnaroli rice · black truffle · aged parmesan', price: 680, mark: 'Chef’s table', image: '🍄' },
  { id: 'd2', name: 'Charred tomato burrata', category: 'Small plates', detail: 'Heirloom tomato · basil oil · sourdough', price: 420, mark: 'Vegetarian', image: '🍅' },
  { id: 'd3', name: 'Miso glazed salmon', category: 'From the kitchen', detail: 'Wild salmon · sesame greens · ginger broth', price: 760, mark: 'Guest favorite', image: '🐟' },
  { id: 'd4', name: 'Wild mushroom toast', category: 'Small plates', detail: 'Sourdough · whipped ricotta · garden herbs', price: 390, mark: 'Vegetarian', image: '🥖' },
  { id: 'd5', name: 'Dark chocolate crémeux', category: 'Something sweet', detail: '70% cacao · sea salt · hazelnut praline', price: 340, mark: 'Made in house', image: '🍫' },
  { id: 'd6', name: 'Vanilla bean panna cotta', category: 'Something sweet', detail: 'Madagascar vanilla · seasonal fruit', price: 320, mark: 'Gluten free', image: '🍮' },
];
export default function Home() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState('All');
  const items = useMemo(() => dishes.filter((dish) => category === 'All' || dish.category === category), [category]);
  const cartItems = dishes.filter((dish) => cart[dish.id]).map((dish) => ({ ...dish, quantity: cart[dish.id] }));
  const total = cartItems.reduce((sum, dish) => sum + dish.price * dish.quantity, 0);
  const qty = Object.values(cart).reduce((sum, value) => sum + value, 0);
  const changeQty = (id: string, delta: number) => setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + delta) }));

  async function requestOtp() {
    setBusy(true);
    try { await sendPhoneOtp(phone.trim()); setOtpSent(true); notification.success({ message: 'Code sent', description: 'Check your phone for a one time verification code.' }); }
    catch (error) { notification.error({ message: 'Could not send code', description: error instanceof Error ? error.message : 'Try again.' }); }
    finally { setBusy(false); }
  }
  async function confirmOtp() {
    setBusy(true);
    try { await verifyPhoneOtp(phone.trim(), otp.trim()); setVerified(true); notification.success({ message: 'Phone number verified' }); }
    catch (error) { notification.error({ message: 'Code not accepted', description: error instanceof Error ? error.message : 'Try again.' }); }
    finally { setBusy(false); }
  }
  async function submitOrder() {
    setBusy(true);
    try {
      const order = await placeCustomerOrder({ customer_phone: phone.trim(), items: cartItems.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })), total });
      setCart({}); setCheckoutOpen(false); setVerified(false); setOtpSent(false); setPhone(''); setOtp('');
      Modal.success({ title: 'Your order is in', content: `Order ${order.id.slice(0, 8).toUpperCase()} has been sent to our kitchen.`, okText: 'Lovely' });
    } catch (error) { notification.error({ message: 'Order not placed', description: error instanceof Error ? error.message : 'Please try again.' }); }
    finally { setBusy(false); }
  }

  return <main className="guest-page">
    <header className="guest-nav"><Link href="/" className="brand-lockup"><span className="brand-mark">É</span><span><strong>ÉTOILE</strong><small>KITCHEN & TABLE</small></span></Link><nav><a href="#menu">The menu</a><a href="#story">Our table</a></nav><Button className="nav-order" onClick={() => setCheckoutOpen(true)} icon={<ShoppingOutlined />}>Your order <span className="cart-count">{qty}</span></Button></header>
    <section className="guest-hero" id="story"><div className="hero-copy"><span className="eyebrow"><i /> A LITTLE SEASONAL MAGIC</span><h1>Good food.<br/><em>Good company.</em></h1><p>Thoughtfully sourced, cooked with care, and ready to share. Browse what’s cooking and place your order in a few easy steps.</p><a className="hero-link" href="#menu">Explore the menu <ArrowRightOutlined /></a><div className="hero-meta"><span>FRESH FROM OUR KITCHEN</span><b>·</b><span>MADE TO ORDER</span></div></div><div className="hero-art"><div className="sun-disc"/><div className="plate"><div className="plate-inner"><span>✳</span><span>✦</span><span>❋</span><b>seasonal<br/>& lovely</b></div></div><div className="art-note">A good meal<br/>starts with good<br/>ingredients.</div><span className="art-spark">✳</span></div></section>
    <section className="menu-section" id="menu"><div className="section-head"><div><span className="eyebrow">A NOTE FROM THE KITCHEN</span><h2>On the menu <span>today</span></h2><p>Small batches, seasonal ingredients, and a little something for everyone.</p></div><span className="menu-count">{dishes.length} kitchen favorites</span></div>
      <div className="category-tabs">{['All', 'Small plates', 'From the kitchen', 'Something sweet'].map((name) => <button key={name} className={category === name ? 'selected' : ''} onClick={() => setCategory(name)}>{name}</button>)}</div>
      <div className="dish-grid">{items.map((dish) => <Card key={dish.id} className="dish-card" bordered={false}><div className={`dish-visual visual-${dish.id}`}><span>{dish.image}</span><Tag>{dish.mark}</Tag></div><div className="dish-info"><div><h3>{dish.name}</h3><p>{dish.detail}</p></div><strong className="dish-price">₹{dish.price}</strong></div><div className="dish-action">{cart[dish.id] ? <div className="quantity-control"><button aria-label="Remove one" onClick={() => changeQty(dish.id, -1)}><MinusOutlined /></button><b>{cart[dish.id]}</b><button aria-label="Add one" onClick={() => changeQty(dish.id, 1)}><PlusOutlined /></button></div> : <Button className="add-button" onClick={() => changeQty(dish.id, 1)}>Add to order <PlusOutlined /></Button>}</div></Card>)}</div>
    </section>
    <footer className="guest-footer"><Link href="/" className="brand-lockup"><span className="brand-mark">É</span><span><strong>ÉTOILE</strong><small>KITCHEN & TABLE</small></span></Link><span>Made thoughtfully, served with care.</span><Link href="/admin/login" className="staff-link">Staff sign in <ArrowRightOutlined /></Link></footer>

    <Modal title={<div className="checkout-title"><span className="brand-mark">É</span><span>Your order <small>A little check before we send it to the kitchen</small></span></div>} open={checkoutOpen} onCancel={() => setCheckoutOpen(false)} footer={null} width={520} destroyOnClose>
      {!cartItems.length ? <Empty description="Your order is waiting for something delicious." /> : <>
        <div className="checkout-list">{cartItems.map((item) => <div className="checkout-row" key={item.id}><span>{item.quantity} × {item.name}</span><b>₹{item.price * item.quantity}</b></div>)}<div className="checkout-total"><span>Total</span><b>₹{total}</b></div></div>
        {!isSupabaseConfigured && <Alert type="warning" showIcon message="Online ordering needs Supabase setup" description="Add your Supabase project URL and anon key to .env.local, then configure Phone OTP in Supabase Auth." />}
        <label className="form-label">Your mobile number</label><Input size="large" placeholder="+91 98765 43210" value={phone} onChange={(event) => { setPhone(event.target.value); setVerified(false); setOtpSent(false); }} disabled={verified} />
        {!otpSent && <Button block size="large" type="primary" className="checkout-submit" disabled={!isSupabaseConfigured || !phone.trim()} loading={busy} onClick={requestOtp}>Send verification code</Button>}
        {otpSent && !verified && <div className="otp-panel"><p>Enter the code sent to <b>{phone}</b></p><Input size="large" inputMode="numeric" autoComplete="one-time-code" placeholder="6 digit code" value={otp} onChange={(event) => setOtp(event.target.value)} maxLength={8} /><Button block size="large" type="primary" className="checkout-submit" loading={busy} disabled={!otp.trim()} onClick={confirmOtp}>Verify number</Button><button className="resend-link" onClick={requestOtp} disabled={busy}>Send a new code</button></div>}
        {verified && <div className="verified-panel"><CheckCircleFilled /> <span>Number verified. We’ll use it to confirm this order.</span></div>}
        {verified && <Button block size="large" type="primary" className="checkout-submit" loading={busy} onClick={submitOrder}>Place order · ₹{total}</Button>}
        <p className="privacy-note">Your number is only used to verify and follow up on this order.</p>
      </>}
    </Modal>
  </main>;
}
