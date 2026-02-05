-- Create a function to decrease product stock securely
CREATE OR REPLACE FUNCTION public.decrease_product_stock(
  p_product_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock integer;
BEGIN
  -- Get current stock
  SELECT stock INTO current_stock FROM products WHERE id = p_product_id;
  
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  IF current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;
  
  -- Update stock
  UPDATE products 
  SET stock = stock - p_quantity, 
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;