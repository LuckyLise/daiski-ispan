import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF } from 'react-icons/fa';
import { BsLine } from 'react-icons/bs';
import { FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Footer() {
  return (
    <footer className="bg-[#072136] text-[#ffffff] py-12 px-4 md:px-8">
      <div className="hidden md:flex flex-col gap-8 md:flex-row md:gap-8 xl:gap-32 mx-auto justify-center">
        {/* Logo and Contact Info */}
        <div className="">
          {/* 左側 Logo */}
          <div className=" m-4">
            <Link href="/">
              <Image
                src="/LOGO-white.svg"
                alt="DAISKI"
                width={150}
                height={40}
                className=""
              />
            </Link>
          </div>
          <div className="space-y-2 text-base">
            <p>桃園市 32056 中壢區新生路二段421號</p>
            <p className="font-en">Mail: DAISKI@gmail.com</p>
            <p>Tel: +886 0912-345-678</p>
            <p>© 2025 by DAISKI</p>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="">
          <h3 className="font-medium mb-4 text-2xl">關於DAISKI</h3>
          <ul className="space-y-2 text-base">
            <li>
              <Link href="#" className="hover:underline">
                榮譽時刻
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                大事記
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                人才招募
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                隱私權申明
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                服務條款
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                商品專櫃總覽
              </Link>
            </li>
          </ul>
        </div>

        <div className="">
          <h3 className="font-medium mb-4 text-2xl">顧客權益</h3>
          <ul className="space-y-2 text-base">
            <li>
              <Link href="#" className="hover:underline">
                聯絡我們
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                常見Q&A
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                防詐騙宣導
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                退換貨說明
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                24h到貨說明
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                政令宣導
              </Link>
            </li>
          </ul>
        </div>

        <div className="">
          <h3 className="font-medium mb-4 text-2xl">其他服務</h3>
          <ul className="space-y-2 text-base">
            <li>
              <Link href="#" className="hover:underline">
                旅遊
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                美食
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                觀光
              </Link>
            </li>
          </ul>
        </div>

        <div className="">
          <h3 className="font-medium mb-4 text-2xl">企業合作</h3>
          <ul className="space-y-2 text-base">
            <li>
              <Link href="#" className="hover:underline">
                招商專區
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                媒體聯繫
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                大型預約
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media Icons */}
        <div>
          <div className="mt-6 grid grid-cols-2 gap-4 max-w-36">
            <Link
              href="https://www.facebook.com/"
              className="flex items-center justify-center "
            >
              <FaFacebookF className="size-12 bg-[#ffffff] text-primary-800 p-2 rounded-md" />
            </Link>
            <Link
              href="https://www.line.me/tw/"
              className="flex items-center justify-center "
            >
              <BsLine className="size-12 bg-[#ffffff] text-primary-800 p-2 rounded-md" />
            </Link>
            <Link
              href="https://www.instagram.com/"
              className="flex items-center justify-center"
            >
              <FaInstagram className="size-12 bg-[#ffffff] text-primary-800 p-2 rounded-md" />
            </Link>
            <Link
              href="https://x.com/"
              className="flex items-center justify-center "
            >
              <FaXTwitter className="size-12 bg-[#ffffff] text-primary-800 p-2 rounded-md" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:hidden">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {/* 關於 DAISKI */}
          <AccordionItem value="about-daiski">
            <AccordionTrigger className="font-medium text-2xl cursor-none">
              關於DAISKI
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <ul className="space-y-2 text-base">
                <li>
                  <Link href="#" className="hover:underline">
                    榮譽時刻
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    大事記
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    人才招募
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    隱私權申明
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    服務條款
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    商品專櫃總覽
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* 顧客權益 */}
          <AccordionItem value="customer-rights">
            <AccordionTrigger className="font-medium text-2xl cursor-none">
              顧客權益
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <ul className="space-y-2 text-base">
                <li>
                  <Link href="#" className="hover:underline">
                    聯絡我們
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    常見Q&A
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    防詐騙宣導
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    退換貨說明
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    24h到貨說明
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    政令宣導
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* 其他服務 */}
          <AccordionItem value="other-services">
            <AccordionTrigger className="font-medium text-2xl cursor-none">
              其他服務
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <ul className="space-y-2 text-base">
                <li>
                  <Link href="#" className="hover:underline">
                    旅遊
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    美食
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    觀光
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* 企業合作 */}
          <AccordionItem value="corporate-partnership">
            <AccordionTrigger className="font-medium text-2xl cursor-none">
              企業合作
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <ul className="space-y-2 text-base">
                <li>
                  <Link href="#" className="hover:underline">
                    招商專區
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    媒體聯繫
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    大型預約
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div>
          <div className="flex flex-row justify-center gap-8 mt-8">
            <Link
              href="https://www.facebook.com/"
              className="flex items-center justify-center "
            >
              <FaFacebookF className="size-10 bg-[#ffffff] text-primary-800 p-2 rounded-md" />
            </Link>
            <Link
              href="https://www.line.me/tw/"
              className="flex items-center justify-center "
            >
              <BsLine className="size-10 bg-[#ffffff] text-primary-800 p-2 rounded-md" />
            </Link>
            <Link
              href="https://www.instagram.com/"
              className="flex items-center justify-center"
            >
              <FaInstagram className="size-10 bg-[#ffffff] text-primary-800 p-2 rounded-md" />
            </Link>
            <Link
              href="https://x.com/"
              className="flex items-center justify-center "
            >
              <FaXTwitter className="size-10 bg-[#ffffff] text-primary-800 p-2 rounded-md" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
