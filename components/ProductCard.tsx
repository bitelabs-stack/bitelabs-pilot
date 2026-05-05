type Product = {
  id: string
  sku: string
  name: string
  unit: string
  price_krw: number
  min_order_qty: number
  in_stock: boolean
}

export default function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: (product: Product, qty: number) => void
}) {
  return (
    <div className="border rounded-lg p-4 flex flex-col gap-2">
      {!product.in_stock && (
        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded w-fit">품절</span>
      )}
      <p className="font-medium">{product.name}</p>
      <p className="text-sm text-gray-500">
        {product.price_krw.toLocaleString()}원 / {product.unit}
      </p>
      <p className="text-xs text-gray-400">최소 {product.min_order_qty}{product.unit}</p>
      <button
        disabled={!product.in_stock}
        onClick={() => onAddToCart(product, product.min_order_qty)}
        className="mt-auto bg-blue-600 text-white py-1.5 rounded text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        담기
      </button>
    </div>
  )
}
