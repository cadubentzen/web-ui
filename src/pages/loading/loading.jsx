import React,{ PureComponent } from 'react';
import { Center, Loader } from '../../components/atoms';
import PageBackground from '../../components/atoms/PageBackground';



export class AppLoadingPage extends PureComponent {
    render() {
        return <PageBackground>
            <Center>
                <Loader size='15vh' color='white' type='clipped' />
            </Center>
            
            
        </PageBackground>
    }
}

