import React, { useEffect, useMemo, useState } from 'react';
import { fetchTrees, placeOrder, type OrderPayload, type Tree } from './api';

type Status =
  | { type: 'idle'; message: '' }
  | { type: 'loading'; message: string }
  | { type: 'error'; message: string }
  | { type: 'success'; message: string };

type OrderFormState = {
  customer_name: string;
  phone: string;
  quantity: number | string;
  delivery_location: string;
};

const App = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [status, setStatus] = useState<Status>({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderFormState>({
    customer_name: '',
    phone: '',
    quantity: 1,
    delivery_location: '',
  });

  useEffect(() => {
    const getTrees = async () => {
      try {
        setStatus({ type: 'loading', message: 'Loading available trees…' });
        const list = await fetchTrees();
        setTrees(list);
        setStatus({ type: 'idle', message: '' });
      } catch (e) {
        setStatus({
          type: 'error',
          message: e instanceof Error ? e.message : 'Failed to load trees.',
        });
      }
    };
    getTrees();
  }, []);

  const activeTrees = useMemo(() => trees.filter((t) => t?.is_active !== false), [trees]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTree?._id) return;

    try {
      setIsSubmitting(true);
      setStatus({ type: 'loading', message: 'Placing your order…' });

      const payload: OrderPayload = {
        customer_name: orderDetails.customer_name.trim(),
        phone: orderDetails.phone.trim(),
        tree_id: selectedTree._id,
        quantity: Number(orderDetails.quantity),
        delivery_location: orderDetails.delivery_location.trim(),
      };

      await placeOrder(payload);

      setStatus({
        type: 'success',
        message: 'Order placed successfully. We’ll contact you shortly.',
      });
      setOrderDetails({ customer_name: '', phone: '', quantity: 1, delivery_location: '' });
      setSelectedTree(null);
    } catch (e) {
      setStatus({
        type: 'error',
        message: e instanceof Error ? e.message : 'Failed to place order. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            🌿
          </div>
          <div className="brand-text">
            <h1>HIMSOLS Tree Shop</h1>
            <p>Simple, eco-friendly tree orders. Secure and straightforward.</p>
          </div>
        </div>
      </header>

      {status.type !== 'idle' && (
        <div
          className={`notice ${status.type === 'error' ? 'notice--error' : ''} ${
            status.type === 'success' ? 'notice--success' : ''
          }`}
          role={status.type === 'error' ? 'alert' : 'status'}
        >
          {status.message}
        </div>
      )}

      {!selectedTree ? (
        <main className="content">
          <div className="content-head">
            <h2 className="section-title">Available trees</h2>
            <p className="section-subtitle">Pick a tree and place an order in under a minute.</p>
          </div>

          <section className="tree-list" aria-busy={status.type === 'loading'}>
            {activeTrees.map((tree) => (
              <article key={tree._id} className="tree-card">
                <div className="tree-imageWrap">
                  {tree.image_url ? (
                    <img src={tree.image_url} alt={tree.name} className="tree-image" loading="lazy" />
                  ) : (
                    <div className="tree-imageFallback" aria-hidden="true">
                      No image
                    </div>
                  )}
                </div>
                <div className="tree-body">
                  <h3 className="tree-title">{tree.name}</h3>
                  <p className="tree-description">{tree.description}</p>
                  <div className="tree-footer">
                    <div className="tree-price" aria-label={`Price ${tree.price ?? ''}`}>
                      ₹ {tree.price}
                    </div>
                    <button className="buy-button" onClick={() => setSelectedTree(tree)}>
                      Buy tree
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {status.type !== 'loading' && activeTrees.length === 0 && (
              <div className="empty">
                <div className="empty-title">No trees available right now</div>
                <div className="empty-subtitle">Please check back soon.</div>
              </div>
            )}
          </section>
        </main>
      ) : (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Order form">
          <div className="modal">
            <div className="modal-head">
              <div>
                <div className="modal-eyebrow">Order</div>
                <h2 className="modal-title">{selectedTree.name}</h2>
              </div>
              <button
                className="iconButton"
                type="button"
                onClick={() => setSelectedTree(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form className="order-form" onSubmit={handleOrderSubmit}>
              <div className="formRow">
                <label className="field">
                  <span className="field-label">Your name</span>
                  <input
                    type="text"
                    value={orderDetails.customer_name}
                    onChange={(e) => setOrderDetails({ ...orderDetails, customer_name: e.target.value })}
                    autoComplete="name"
                    required
                    disabled={isSubmitting}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Phone</span>
                  <input
                    type="tel"
                    value={orderDetails.phone}
                    onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="e.g. 9876543210"
                    required
                    disabled={isSubmitting}
                  />
                </label>
              </div>

              <div className="formRow">
                <label className="field">
                  <span className="field-label">Quantity</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={orderDetails.quantity}
                    onChange={(e) => setOrderDetails({ ...orderDetails, quantity: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Delivery location</span>
                  <input
                    type="text"
                    value={orderDetails.delivery_location}
                    onChange={(e) =>
                      setOrderDetails({ ...orderDetails, delivery_location: e.target.value })
                    }
                    autoComplete="street-address"
                    required
                    disabled={isSubmitting}
                  />
                </label>
              </div>

              <div className="trustRow">
                <div className="trustItem">No login required</div>
                <div className="trustDot" aria-hidden="true">
                  •
                </div>
                <div className="trustItem">We only use your phone to confirm delivery</div>
              </div>

              <div className="actions">
                <button className="submit-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Placing order…' : 'Place order'}
                </button>
                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => setSelectedTree(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} HIMSOLS</span>
          <span className="footer-dot" aria-hidden="true">
            •
          </span>
          <span>Orders powered by our verified backend</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
