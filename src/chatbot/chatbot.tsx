import React from 'react'
import ChatBot from 'react-simple-chatbot';
import { headerTitle, standardGridHeight } from '../common';
import { ThemeProvider } from 'styled-components';

// const skyBlue = '#4FC3F7';
const babyBlue = '#82caff';
const headerBgColor = "#1e90ff";

const otherFontTheme = {
    background: '#f0f0f0',
    // fontFamily: 'Helvetica Neue',
    headerBgColor: headerBgColor,
    headerFontColor: '#fff',
    headerFontSize: '16px',
    botBubbleColor: '#fff',
    botFontColor: '#303030',
    userBubbleColor: babyBlue,
    userFontColor: '#303030'
};

interface MyChatBotProps {
    steps: any;
}

export const MyChatBot = (props: MyChatBotProps) => {
    return (
        <ThemeProvider theme={otherFontTheme}>
            <React.StrictMode>
                <ChatBot
                    hideBotAvatar={true}
                    hideUserAvatar={true}
                    placeholder="Chat with me"
                    width="100%"
                    height={standardGridHeight}
                    userDelay={0}
                    botDelay={0}
                    customDelay={0}
                    headerTitle={headerTitle}
                    steps={props.steps} />
            </React.StrictMode>
        </ThemeProvider>
    );
}

export default MyChatBot;
