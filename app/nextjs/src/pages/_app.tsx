import { AppProps } from 'next/app';

import { AppProvider } from '@/components/content/AppProvider/AppProvider';
import { Context, Content } from '@/app/layout';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Context>
            <AppProvider>
                <Content children={<Component {...pageProps} />} />
            </AppProvider>
        </Context>
    );
}

export default MyApp;