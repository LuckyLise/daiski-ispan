import Container from '@/components/container';
import Process from './_components/process';

export default function CartLayout({ children }) {
  return (
    <>
      <Container>
        {/* <h3 className="text-h3-tw text-primary-600 mt-5">CART | 購物車 </h3> */}
        <div className="mb-8">{children}</div>
      </Container>
    </>
  );
}
