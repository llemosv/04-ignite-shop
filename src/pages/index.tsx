import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { useKeenSlider } from 'keen-slider/react';
import Stripe from 'stripe';

import { HomeContainer, Product } from '../styles/pages/home';
import { stripe } from '../lib/stripe';

import 'keen-slider/keen-slider.min.css';
import Head from 'next/head';

interface IProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
}

interface HomeProps {
  products: IProduct[];
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    },
  });
  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
      </Head>

      <HomeContainer ref={sliderRef} className="keen-slider">
        {products.map((product) => {
          return (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              prefetch={false}
            >
              <Product className="keen-slider__slide">
                <Image src={product.imageUrl} width={520} height={480} alt="" />

                <footer>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </footer>
              </Product>
            </Link>
          );
        })}
      </HomeContainer>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
    active: true,
  });

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price;

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      url: product.url,
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format((price.unit_amount as number) / 100),
    };
  });
  return {
    props: {
      products,
    },
    revalidate: 60 * 60 * 1, //A cada 1 hora será regerada uma nova página estática
  };
};
