import type { Order } from '../types/types'

interface PrintBillProps {
  order: Order
  onClose: () => void
}

const PrintBill = ({ order, onClose }: PrintBillProps) => {

  const handlePrint = () => {
    window.print()
  }

  // Styles
  const cellStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: '1mm 2mm',
    fontSize: '11px',
    verticalAlign: 'top',
  }

  return (
    <>
      {/* Print styles — optimized for 80mm thermal paper */}
      <style>{`
        @media print {
          * { visibility: hidden !important; }
          #thermal-bill, #thermal-bill * { visibility: visible !important; }
          #thermal-bill {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 72mm !important;
            margin: 0 !important;
            padding: 2mm !important;
          }
          #no-print { display: none !important; }
          @page {
            size: 80mm auto;
            margin: 2mm;
          }
        }
      `}</style>

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

          {/* Action Buttons */}
          <div id="no-print" className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-on-surface">Receipt Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                Print
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Receipt — 80mm thermal bill matching actual Horbax format */}
          <div
            id="thermal-bill"
            style={{
              width: '72mm',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '12px',
              padding: '3mm',
              backgroundColor: 'white',
              color: 'black',
              lineHeight: '1.3',
            }}
          >
            {/* ====== SHOP HEADER ====== */}
            <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '2px',
              }}>
                HORBAX
              </div>
              <div style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                LAUNDRY & DRY CLEANING
              </div>
              <div style={{ fontSize: '8px', marginTop: '1mm' }}>
                A.N COMPLEX POYILOOR
              </div>
              <div style={{ fontSize: '8px' }}>
                807 800 5757, 807 800 3737
              </div>
            </div>

            <div style={{ borderTop: '1px solid black', margin: '2mm 0' }} />

            {/* ====== BILL INFO ROW ====== */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              marginBottom: '1mm',
            }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>No: </span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{order.orderId}</span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>Date: </span>
                <span style={{ fontWeight: 'bold' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            {/* ====== CUSTOMER ROW ====== */}
            <div style={{ fontSize: '11px', marginBottom: '1mm' }}>
              <span>To: </span>
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
                {order.customerName}
              </span>
            </div>

            {/* Phone */}
            <div style={{ fontSize: '10px', marginBottom: '1mm' }}>
              <span>Ph: </span>
              <span style={{ fontWeight: 'bold' }}>{order.phone}</span>
            </div>

            {/* Delivery date if exists */}
            {order.deliveryDate && (
              <div style={{ fontSize: '10px', marginBottom: '1mm' }}>
                <span>Delivery: </span>
                <span style={{ fontWeight: 'bold' }}>{order.deliveryDate}</span>
              </div>
            )}

            {/* Delivery type + address */}
            {order.deliveryType === 'home_delivery' && (
              <div style={{ fontSize: '10px', marginBottom: '1mm' }}>
                <span style={{ fontWeight: 'bold' }}>Home Delivery</span>
                {order.deliveryAddress && (
                  <span> - {order.deliveryAddress}</span>
                )}
              </div>
            )}

            {/* ====== ITEMS TABLE ====== */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '2mm',
              marginBottom: '0',
            }}>
              <thead>
                <tr>
                  <th style={{
                    ...cellStyle,
                    fontSize: '9px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    width: '8mm',
                    letterSpacing: '0.3px',
                  }}>
                    Sl
                  </th>
                  <th style={{
                    ...cellStyle,
                    fontSize: '9px',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    letterSpacing: '0.3px',
                  }}>
                    Particulars
                  </th>
                  <th style={{
                    ...cellStyle,
                    fontSize: '9px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    width: '10mm',
                    letterSpacing: '0.3px',
                  }}>
                    Qty
                  </th>
                  <th style={{
                    ...cellStyle,
                    fontSize: '9px',
                    fontWeight: 'bold',
                    textAlign: 'right',
                    width: '18mm',
                    letterSpacing: '0.3px',
                  }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td style={{
                      ...cellStyle,
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}>
                      {index + 1}
                    </td>
                    <td style={{
                      ...cellStyle,
                      fontWeight: 'bold',
                    }}>
                      {item.cloth}
                      <div style={{ fontSize: '9px', fontWeight: 'normal', color: '#444' }}>
                        ({item.wash})
                      </div>
                    </td>
                    <td style={{
                      ...cellStyle,
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}>
                      {item.qty}
                    </td>
                    <td style={{
                      ...cellStyle,
                      textAlign: 'right',
                      fontWeight: 'bold',
                    }}>
                      {item.price != null && item.price > 0 ? `${item.price}/-` : '-'}
                    </td>
                  </tr>
                ))}

                {/* Delivery charge row */}
                {order.deliveryType === 'home_delivery' && order.deliveryCharge > 0 && (
                  <tr>
                    <td style={{ ...cellStyle, textAlign: 'center' }}></td>
                    <td style={{
                      ...cellStyle,
                      fontWeight: 'bold',
                      fontSize: '10px',
                    }}
                      colSpan={1}
                    >
                      Delivery
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'center' }}></td>
                    <td style={{
                      ...cellStyle,
                      textAlign: 'right',
                      fontWeight: 'bold',
                    }}>
                      {order.deliveryCharge}/-
                    </td>
                  </tr>
                )}

                {/* TOTAL ROW */}
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      ...cellStyle,
                      textAlign: 'right',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      paddingRight: '3mm',
                    }}
                  >
                    TOTAL
                  </td>
                  <td style={{
                    ...cellStyle,
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}>
                    {order.total}/-
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ====== NOTES ====== */}
            {order.notes && (
              <div style={{ fontSize: '9px', marginTop: '2mm' }}>
                <span style={{ fontWeight: 'bold' }}>Note: </span>
                {order.notes}
              </div>
            )}

            {/* ====== STATUS ====== */}
            <div style={{ textAlign: 'center', marginTop: '3mm', fontSize: '10px' }}>
              <div style={{
                display: 'inline-block',
                padding: '1mm 4mm',
                border: '1px solid black',
                fontWeight: 'bold',
                letterSpacing: '1px',
                fontSize: '10px',
              }}>
                {order.status === 'completed'
                  ? 'COLLECTED'
                  : order.status === 'ready'
                  ? 'READY FOR PICKUP'
                  : 'IN PROGRESS'}
              </div>
            </div>

            {/* ====== FOOTER ====== */}
            <div style={{ borderTop: '1px dashed black', margin: '3mm 0 2mm 0' }} />

            <div style={{ textAlign: 'center', fontSize: '9px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '1mm' }}>
                SHOW THIS BILL TO COLLECT
              </div>
              <div>
                Bill No: {order.orderId}
              </div>
              <div style={{ marginTop: '1mm' }}>
                Thank you for choosing Horbax!
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PrintBill