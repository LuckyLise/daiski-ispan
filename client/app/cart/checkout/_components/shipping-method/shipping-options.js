'use client';
import { useFormContext } from 'react-hook-form';
export default function ShippingOptions({
  onChange = () => {},
  name = '',
  radioValue = '',
}) {
  const { register } = useFormContext();

  return (
    <>
      <label className="inline-flex items-center space-x-2 relative">
        <input
          type="radio"
          name="shippingMethod"
          className="peer appearance-none w-4 h-4 rounded-full border-2 border-primary-600   checked:border-primary-600"
          value={radioValue}
          {...register('shippingMethod', { required: true })}
        />
        {/* 內部圓點 */}
        <span className="pointer-events-none w-2  h-2 rounded-full bg-primary-600 absolute left-1 my-auto opacity-0 peer-checked:opacity-100" />

        <h6 className=" text-p-tw">{name}</h6>
      </label>
    </>
  );
}
