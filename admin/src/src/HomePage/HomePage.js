import React from 'react';
import { connect } from 'react-redux';
import {Layout,  Icon ,Menu, BackTop} from 'antd';
import { userActions } from '../_actions';
import './HomePage.css'
import {EventPage} from '../EventPage/EventPage'
import {QuestionPage} from '../QuestionPage/QuestionPage'
const { Header, Sider, Content } = Layout;

class HomePage extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            session: 'event',
        };

    }

    componentDidMount() {
        this.props.dispatch(userActions.getAll());

    }

    handleDeleteUser(id) {
        return (e) => this.props.dispatch(userActions.delete(id));
    }
    state = {
        collapsed: false,
    };
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    logout = () => {
        this.props.dispatch(userActions.logout());
        this.props.history.push('/login')
    }

    handleMenu =(e) =>{
        console.log(e);
        switch (e.key) {
            case 'event':
                this.setState({'session':'event'})
                break;
            case 'question':
                this.setState({'session':'question'})
                break;
            default:

        }

    }

    render() {
        return (
            <Layout className="home-layout">
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={this.state.collapsed}
                >
                    <div className="logo" />
                    <Menu theme="dark" mode="inline" onClick={this.handleMenu} defaultSelectedKeys={['event']}>
                        <Menu.Item key="event">
                            <Icon type="clock-circle-o" />
                            <span>Event</span>
                        </Menu.Item>
                        <Menu.Item key="question">
                            <Icon type="question-circle-o" />
                            <span>Question</span>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff', padding: 0 }}>
                        <Icon
                            className="trigger"
                            type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                            onClick={this.toggle}
                        />
                        <Icon style={{float:'right'}}
                              className="trigger"
                              type="logout"
                              onClick={this.logout}
                        />

                    </Header>
                    <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                        {this.state.session ==='event'
                        ?
                            <div>
                                <EventPage></EventPage>
                            </div>
                            :<div></div>
                        }
                        {this.state.session ==='question'
                            ?
                            <QuestionPage></QuestionPage>
                            :<div></div>
                        }
                        <BackTop>
                            <div className="ant-back-top-inner">
                                <Icon type="arrow-up" />
                            </div>
                        </BackTop>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

function mapStateToProps(state) {
    const { users, authentication } = state;
    const { user } = authentication;
    return {
        user,
        users
    };
}

const connectedHomePage = connect(mapStateToProps)(HomePage);
export { connectedHomePage as HomePage };