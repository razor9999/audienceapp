import React from 'react';
import io from 'socket.io-client';
import {Input} from 'antd';
import './App.css';
import {reactLocalStorage} from 'reactjs-localstorage';

import Moment from 'react-moment';
import moment from 'moment';
import {Card, Avatar} from 'antd';
import {Divider} from 'antd';
import {Layout, Menu, Icon, Button, Row, Col, Dropdown, List, Alert, BackTop} from 'antd';

const {Meta} = Card;
const {Header, Content, Footer, Sider} = Layout;


const Search = Input.Search;
const color = ['#e62f2f', '#1755e6', '#a212b3', '#ea1f62', '#04a9f4', '#f54336', '#ea1f62', '#663ab7', '#ff9701'];


export default class App extends React.Component {
    constructor(props) {
        super(props);
        //Khởi tạo state,
        this.state = {
            event: reactLocalStorage.getObject('event'),
            messages: [], // the list of question
            userOnline: [], // danh sách người dùng đang online
            collapsed: false,
            newQuestion: false,
            currentUser: reactLocalStorage.get('currentUser', ''),
            tmpUser: '',
            textUser: '',
            size: 'large',
            isAnonymous: reactLocalStorage.get('isAnonymous', true),
            question: '',
            sort: {
                text: 'Most likely',
                key: 'liked',
                order: 'desc'
            },
            orders: [['liked', 'desc']],
            inputUser: false,
            listData:[]

        }

        if (this.state.currentUser === '') {
            this.state = Object.assign({}, this.state, {
                inputUser: true
            })
        }

        this.state = Object.assign({}, this.state, {
            pagination: {
                pageSize: 10,
                current: 1,
                total: 0
            }
        })


        this.socket = null;
        this.join = this.join.bind(this)

        // bind some event change of menu and paging
        this.toogleNewquestion = this.toogleNewquestion.bind(this)
        this.handleMenuSelectUserClick = this.handleMenuSelectUserClick.bind(this)
        this.paginationChange = this.paginationChange.bind(this)
        this.handleMenuSortClick = this.handleMenuSortClick.bind(this)
        this.handleLike = this.handleLike.bind(this)
        this.switchEvent = this.switchEvent.bind(this)

    }

    componentWillMount() {
        //console.log(this.state.user)
        this.socket = io('http://localhost:6969/');
        this.socket.on('newMessage', (response) => {
            this.newMessage(response)
        }); //lắng nghe khi có tin nhắn mới
        this.socket.on('joinFail', (response) => {
            this.setState({joinFail: true});
            this.setState({joinFailMsg: response});

        }); //join fail
        this.socket.on('joinSuccess', (response) => {
            this.joinSuccess(response)
        }); //join thành công
        this.socket.on('newQuestionSuccess', (response) => {
            this.newQuestionSuccess(response)
        });
        if (this.state.event.id && this.state.event.code) {
            let myQuestion = reactLocalStorage.getObject('myQuestion', []);
            if(Object.keys(myQuestion).length === 0 && myQuestion.constructor === Object){
                myQuestion =[];
            }
            this.socket.emit('showQuestion', {
                id: this.state.event.id,
                pageSize: this.state.pagination.pageSize,
                pageIndex: this.state.pagination.current - 1,
                orders: this.state.orders,
                myQuestion: myQuestion
            });
        }

        this.socket.on('showQuestionSuccess', (response) => {
            this.showQuestionSuccess(response)
        });


        this.socket.on('likedAndDislikedSuccess', (response) => {
            this.likedAndDislikedSuccess(response)
        });


    }

    //join into event
    join(e) {
        //console.log(e);
        this.socket.emit("join", {code: e, date: moment().format('YYYY-MM-DD'), tz: moment().format('Z')});
    }

    joinSuccess(event) {
        this.setState({event: event})
        reactLocalStorage.setObject('event', event);
        let myQuestion = reactLocalStorage.getObject('myQuestion', []);
        //console.log(myQuestion);
        if(Object.keys(myQuestion).length === 0 && myQuestion.constructor === Object){
            myQuestion =[];
        }

        this.socket.emit('showQuestion', {
            id: this.state.event.id,
            pageSize: this.state.pagination.pageSize,
            pageIndex: this.state.pagination.current - 1,
            orders: this.state.orders,
            myQuestion:myQuestion
        });


    }

    setJoinFail() {
        this.setState({joinFail: false})

    }

    newQuestionSuccess(response) {
        this.setState({newQuestion: false})
        //console.log(response)
        // reset pagination
        this.setState({
            pagination: {
                pageSize: 10,
                current: 1,
                total: 0
            }
        })
        // store localstore

        var myQuestion = reactLocalStorage.getObject('myQuestion', []);
        if (Object.keys(myQuestion).length === 0 && myQuestion.constructor === Object) {
            myQuestion = [];
        }

        if (myQuestion[response.id] === undefined) {
            //console.log("CCCCC");
            myQuestion.push(response.id);
        }

        reactLocalStorage.setObject('myQuestion', myQuestion);
        this.socket.emit('showQuestion', {
            id: this.state.event.id,
            pageSize: this.state.pagination.pageSize,
            pageIndex: this.state.pagination.current - 1,
            orders: this.state.orders,
            myQuestion: myQuestion

        });

    }


    showQuestionSuccess(response) {
        let like = reactLocalStorage.getObject('like');
        let dislike = reactLocalStorage.getObject('dislike', []);
        let colorTag = reactLocalStorage.getObject('colorTag', []);
        if (Object.keys(like).length === 0 && like.constructor === Object) {
            like = [];
        }
        if (Object.keys(dislike).length === 0 && dislike.constructor === Object) {
            dislike = [];
        }


        console.log(response);
        console.log(dislike);
        console.log(like);

        for (let row of response.entities) { // ReferenceError

            if (colorTag[row.id] === undefined) {
                colorTag[row.id] = color[Math.floor(Math.random() * color.length)];
            }

            row.colorTag = colorTag[row.id]
            row.userLiked = false;
            row.userDisliked = false;
            if (like.indexOf(row.id) !== -1) {
                row.userLiked = true;
            }
            if (dislike.indexOf(row.id) !== -1) {
                row.userDisliked = true;
            }
        }
        reactLocalStorage.setObject('colorTag', colorTag);
        this.setState({listData: response.entities})
        this.setState({
            pagination: {
                pageSize: response.pageSize,
                current: response.pageIndex + 1,
                total: response.count
            }
        })

    }


    likedAndDislikedSuccess(response) {
        console.log(response);

        let {listData} = this.state
        let row = listData.find(x => x.id === response.id)
        row.liked = response.liked;
        row.disliked = response.disliked;


    }


    switchEvent() {
        reactLocalStorage.setObject('event', {});
        this.setState({event: {id: '', code: ''}});
    }

    paginationChange(page) {
        //console.log(page)
        let myQuestion = reactLocalStorage.getObject('myQuestion');
        if(Object.keys(myQuestion).length === 0 && myQuestion.constructor === Object){
            myQuestion =[];
        }

        let {pagination} = this.state;
        //console.log(pagination);
        pagination.pageIndex = page - 1;
        pagination.current = page;
        this.setState({pagination: pagination});

        this.socket.emit('showQuestion', {
            id: this.state.event.id,
            pageSize: this.state.pagination.pageSize,
            pageIndex: page - 1,
            orders: this.state.orders,
            myQuestion: myQuestion
        });

    }

    send(e) {
        //console.log("send");
        //console.log(this.state.question);
        if (this.state.isAnonymous) {
            this.socket.emit("newQuestion", {
                id: this.state.event.id,
                content: this.state.question,
                createdBy: 'Anonymous'
            });
        } else {
            this.socket.emit("newQuestion", {
                id: this.state.event.id,
                content: this.state.question,
                createdBy: this.state.currentUser
            });
        }

    }

    toogleNewquestion(newQuestion) {

        this.setState({newQuestion})
    }

    setCurrentUser(e) {
        //console.log("enter");
        //console.log(this.state.currentUser);
        if (this.state.tmpUser !== '') {
            this.setState({currentUser: this.state.tmpUser})
            this.setState({isAnonymous: false})
            this.setState({inputUser: false})
            reactLocalStorage.set('currentUser', this.state.tmpUser);
            reactLocalStorage.set('isAnonymous', false);

        }

    }

    handleMenuSelectUserClick(e) {
        //console.log('click', e);
        if (e.key === 'anonymous') {
            //console.log('anonymous')
            this.setState({isAnonymous: true})
            reactLocalStorage.set('isAnonymous', true);

        }
        if (e.key === 'user') {
            this.setState({textUser: this.state.currentUser})
            this.setState({isAnonymous: false})
            // update localstorge
            reactLocalStorage.set('currentUser', this.state.currentUser);
            reactLocalStorage.set('isAnonymous', false);


        }
        if (e.key === 'edit') {
            this.setState({inputUser: true})
            this.setState({isAnonymous: false})
            reactLocalStorage.set('isAnonymous', false);

        }


    }

    handleMenuSortClick(e) {
        //console.log('sort', e);
        this.setState({
            pagination: {
                pageSize: 10,
                current: 1,
                total: 0
            }
        })
        let myQuestion = reactLocalStorage.getObject('myQuestion', []);
        if(Object.keys(myQuestion).length === 0 && myQuestion.constructor === Object){
            myQuestion =[];
        }

        switch (e.key) {
            case 'liked':
                //
                this.socket.emit('showQuestion', {
                    id: this.state.event.id,
                    pageSize: this.state.pagination.pageSize,
                    pageIndex: this.state.pagination.current - 1,
                    orders: [['liked', 'desc']],
                    myQuestion: myQuestion
                });
                this.setState({orders: [['liked', 'desc']]})
                this.setState({
                    sort: {
                        text: 'Most likely',
                        key: 'liked',
                        order: 'desc'
                    }
                })
                break;
            case 'createdAt':
                //
                this.socket.emit('showQuestion', {
                    id: this.state.event.id,
                    pageSize: this.state.pagination.pageSize,
                    pageIndex: this.state.pagination.current - 1,
                    orders: [['createdAt', 'desc']],
                    myQuestion: myQuestion
                });
                this.setState({orders: [['createdAt', 'desc']]})
                this.setState({
                    sort: {
                        text: 'Recent Question',
                        key: 'createdAt',
                        order: 'desc'
                    }
                })


                break;
            default:


        }


    }

    // arg:
    // value = like
    // value = dislike
    handleLike(id, value) {
        console.log(id)
        console.log(value)
        // update localstore and emit to server
        //
        let like = reactLocalStorage.getObject('like', []);
        let dislike = reactLocalStorage.getObject('dislike', []);
        if (Object.keys(like).length === 0 && like.constructor === Object) {
            like = [];
        }
        if (Object.keys(dislike).length === 0 && dislike.constructor === Object) {
            dislike = [];
        }

        if (like.indexOf(id) === -1 && dislike.indexOf(id) === -1) {
            this.socket.emit('likedAndDisliked', {
                id: id,
                action: value
            });
            if (value === 'liked') {
                like.push(id);
                reactLocalStorage.setObject('like', like);
            }
            if (value === 'disliked') {
                dislike.push(id);
                reactLocalStorage.setObject('dislike', dislike);
            }

        }

        reactLocalStorage.setObject('like', like);
        reactLocalStorage.setObject('dislike', dislike);

    }

    renderDislike = (item, IconText) => {
        return (
            <IconText
                id={item.id}
                value='disliked'
                type='dislike-o'
                color={item.userDisliked ? '#1755e6' : '#00000'}
                text={item.disliked | "0"}
            />
        );


    }

    renderLike = (item, IconText) => {
        console.log(item)
        return (
            <IconText
                id={item.id}
                value='liked'
                type='like-o'
                color={item.userLiked ? '#1755e6' : '#00000'}
                text={item.liked | "0"}
            />
        );
    }


    render() {


        const IconText = ({type, text, id, value, color}) => (
            <span
                onClick={e => {
                    this.handleLike(id, value);
                }}
                style={{cursor: 'pointer', color: color}}
            >

                    <Icon
                        type={type}
                        style={{marginRight: 8}}
                    />

                {text}
              </span>
        );


        const menuSelectUser = (
            <Menu onClick={this.handleMenuSelectUserClick}>
                <Menu.Item key="anonymous"> <Avatar icon="user"/> Stay Anonymous</Menu.Item>
                <Menu.Item key="user"> <Avatar style={{
                    color: '#f56a00',
                    backgroundColor: '#fde3cf'
                }}>{this.state.currentUser.substring(0, 1).toUpperCase()}</Avatar> {this.state.currentUser}</Menu.Item>
                <Menu.Item key="edit"> Edit user </Menu.Item>
            </Menu>
        );


        const menuSort = (
            <Menu onClick={this.handleMenuSortClick}>
                <Menu.Item key="liked">Most likely</Menu.Item>
                <Menu.Item key="createdAt">Recent Question</Menu.Item>
            </Menu>
        );


        return (
            <div className="app__content" onClick={() => {
                if (this.state.newQuestion) this.toogleNewquestion(false)
            }}>
                {/* if event has exits the app should render event detail */}
                {this.state.event.id && this.state.event.code ?
                    <Layout className="home-layout">
                        <Header style={{padding: 0, backgroundColor: '#226fa5'}}>

                            <Icon style={{float: 'right', color: '#ffffff'}}
                                  className="trigger"
                                  type="user"
                                  onClick={this.logout}
                            />

                        </Header>
                        <Content style={{padding: '0 0'}}>

                            <Layout style={{padding: '24px 0', background: '#fff'}}>
                                <Sider width={300} style={{background: '#fff'}}>
                                    <Card
                                        style={{width: 300}}
                                    >
                                        <Meta
                                            avatar={
                                                <Avatar style={{
                                                    color: '#ffffff',
                                                    backgroundColor: '#188fff',
                                                }}>{this.state.event.title.substring(0, 1).toUpperCase()}</Avatar>

                                            }
                                            title={this.state.event.title}
                                            description={<div>
                                                <Moment format="MMM Do">{this.state.event.from}</Moment> - <Moment
                                                format="MMM Do YYYY">{this.state.event.to}</Moment>
                                                <br/>
                                                #{this.state.event.code}

                                            </div>
                                            }
                                        />
                                    </Card>


                                    <Menu
                                        onClick={this.switchEvent}
                                        mode="inline"
                                        defaultSelectedKeys={['1']}
                                        defaultOpenKeys={['sub1']}
                                        style={{height: '100%'}}
                                    >
                                        <Menu.Item key="swap">
                                            <Icon type="swap"/>Switch Event
                                        </Menu.Item>

                                    </Menu>
                                </Sider>
                                <Content style={{padding: '0 24px', minHeight: 280}}>
                                    <Row>
                                        {this.state.newQuestion ?
                                            <Card onClick={e => e.stopPropagation()}>
                                                <Input.TextArea
                                                    onChange={event => {
                                                        this.setState({question: event.target.value})
                                                    }}

                                                    rows={4} placeholder="Type your question"/>
                                                <Divider></Divider>
                                                <Row>
                                                    <Col span={12}>
                                                        <Row>
                                                            <Col span={2}>
                                                                {!this.state.currentUser || this.state.isAnonymous ?
                                                                    <Avatar icon="user" style={{
                                                                        color: '#ffffff',
                                                                        backgroundColor: '#ab09ea',
                                                                        float: 'left'
                                                                    }}></Avatar>
                                                                    :
                                                                    <Avatar style={{
                                                                        color: '#ffffff',
                                                                        backgroundColor: '#ab09ea',
                                                                        float: 'left'
                                                                    }}>{this.state.currentUser.substring(0, 1).toUpperCase()}</Avatar>


                                                                }

                                                            </Col>

                                                            <Col span={22}>
                                                                {this.state.inputUser ?

                                                                    <Input
                                                                        placeholder="Your name (optional)"
                                                                        defaultValue={this.state.currentUser}
                                                                        onChange={event => {
                                                                            this.setState({tmpUser: event.target.value})
                                                                        }}
                                                                        onPressEnter={this.setCurrentUser.bind(this)}
                                                                        style={{marginLeft: 8, float: 'left'}}/>
                                                                    :
                                                                    <Dropdown overlay={menuSelectUser}>
                                                                        {this.state.isAnonymous ?
                                                                            <Button
                                                                                style={{marginLeft: 8, float: 'left'}}>
                                                                                Anonymous <Icon type="down"/>
                                                                            </Button>
                                                                            :
                                                                            <Button
                                                                                style={{marginLeft: 8, float: 'left'}}>
                                                                                {this.state.currentUser} <Icon
                                                                                type="down"/>
                                                                            </Button>
                                                                        }
                                                                    </Dropdown>
                                                                }
                                                            </Col>

                                                        </Row>
                                                    </Col>
                                                    <Col span={12}><Button
                                                        onClick={this.send.bind(this)}
                                                        type="primary" style={{float: 'right'}}>Send</Button></Col>

                                                </Row>
                                            </Card>
                                            :
                                            <Card onClick={() => this.toogleNewquestion(!this.state.newQuestion)}>
                                                <Button size='large' type='ghost' style={{float: 'left',border:'none'}}>
                                                    <Icon type="edit" style={{fontSize: 24, color: '#08c'}}/>Type your
                                                    question

                                                </Button>
                                            </Card>

                                        }
                                    </Row>
                                    {/*The sorter */}
                                    <Row style={{padding: '20px 0 0 0'}}>
                                        <Dropdown overlay={menuSort}>
                                            <Button style={{float: 'right'}} className="ant-dropdown-link" href="#">
                                                {this.state.sort.text} <Icon type="swap"/>
                                            </Button>
                                        </Dropdown>

                                    </Row>
                                    <Divider/>
                                    <Row>
                                        <List
                                            size="large"
                                            pagination={Object.assign({}, this.state.pagination, {
                                                onChange: page => this.paginationChange(page)
                                            })}
                                            dataSource={this.state.listData}
                                            renderItem={item => (
                                                <List.Item
                                                    key={item.title}
                                                    actions={[this.renderDislike(item, IconText), this.renderLike(item, IconText)]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar style={{
                                                                color: '#ffffff',
                                                                backgroundColor: item.colorTag,
                                                            }}>

                                                                {item.createdBy.substring(0, 1).toUpperCase()}</Avatar>

                                                        }
                                                        title={item.createdBy}
                                                        description=
                                                            {<div>
                                                                <Moment format="MMM Do, YYYY">{item.createdAt}</Moment>
                                                                <br/>
                                                                <br/>
                                                                <h3 style={{}}>{item.content}</h3>

                                                            </div>

                                                            }
                                                    />


                                                </List.Item>
                                            )}
                                        />


                                    </Row>
                                </Content>
                            </Layout>
                        </Content>
                        <Footer style={{textAlign: 'center'}}>
                            Razor9999 ©2018
                        </Footer>
                    </Layout>
                    :
                    <Layout>
                        <div className='bg'>
                            <div style={{margin: 200}}>
                                <Row>
                                    <Col span='12' offset='6'>
                                        <h1 style={{color: '#ffffff'}}>Audience Interaction Made Easy.</h1>
                                        <h5 style={{color: '#ffffff'}}>Live Q&A and Polls for your Meetings & Events
                                        </h5>
                                        <hr/>
                                        <br/>
                                        <div>
                                            <Search
                                                onChange={this.setJoinFail.bind(this)}
                                                placeholder="Enter code here"
                                                prefix="#"
                                                onSearch={this.join}
                                            />

                                        </div>
                                    </Col>
                                </Row>
                                <Row style={{margin: 20}}>
                                    <Col span='12' offset='6'>
                                        {this.state.joinFail ?

                                            <Alert
                                                message={this.state.joinFailMsg}
                                                type="warning"
                                                closable
                                            /> : <div></div>

                                        }
                                    </Col>
                                </Row>
                            </div>

                            <div className="footer">
                                <Row>
                                    <Col span='12' offset='6' style={{color: '#ffffff'}}>
                                        © All rights reserved • 2018 Razor9999
                                    </Col>
                                </Row>
                            </div>

                        </div>
                    </Layout>


                }
                <BackTop>
                    <div className="ant-back-top-inner">
                        <Icon type="arrow-up" />
                    </div>
                </BackTop>

            </div>
        )
    }
}
