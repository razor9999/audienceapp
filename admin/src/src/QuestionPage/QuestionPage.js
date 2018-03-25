import React from 'react';
import {connect} from 'react-redux';
import {Row, Col, Form, Icon, Input, Button, DatePicker, List, Avatar, Card, Rate, message, Checkbox} from 'antd';
import './QuestionPage.css'
import {questionActions} from "../_actions";
import moment from 'moment';
import Moment from 'react-moment';
import {questionConstants} from "../_constants";
import {reactLocalStorage} from 'reactjs-localstorage';

const FormItem = Form.Item;
const color = ['#e62f2f', '#1755e6', '#a212b3', '#ea1f62', '#04a9f4', '#f54336', '#ea1f62', '#663ab7', '#ff9701'];
const Search = Input.Search;

class QuestionPage extends React.PureComponent {

    constructor(props) {
        super(props);
        //Khởi tạo state,
        this.state = {
            edit: false,
            question: {},
            questions: {
                entities: [],
                pageIndex: 0,
                count: 26,
                pageSize: 1,
                pageCount: 26,
                orders: [['id', 'asc']],
            },
            sort: {
                text: 'Most likely',
                key: 'liked',
                order: 'desc'
            },
            orders: [['liked', 'desc']]

        }

        this.state.questions.entities.push({
            id: 1,
            code:  "TEST",
            description: 'TEST.',
            from: '2018-01-01',
            to: '2018-02-10',
            createdBy: 'Anonymous'
        });
        this.state = Object.assign({}, this.state, {
            pagination: {
                pageSize: 10,
                current: 1,
                pageIndex: 0,
                total: 0,
                orders: [['createdAt', 'desc']],
                code: null

            }
        })
        this.paginationChange = this.paginationChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

    }


    componentWillMount = () => {

        this.props.dispatch(questionActions.getAll(this.state.pagination));

    }

    componentWillReceiveProps = (nextProps) => {
        console.log(1, nextProps)
        const {dispatch} = this.props;

        if (nextProps.behavior === questionConstants.UPDATE_SUCCESS) {
            console.log('nextprops', nextProps.question)
            this.setState({question: nextProps.question})
            this.setState({edit:false});
            message.success('the question has been updated.');

            dispatch(questionActions.getAll(this.state.pagination));

        }


        if (nextProps.behavior === questionConstants.GETALL_SUCCESS) {
            let colorTag = reactLocalStorage.getObject('colorTag', []);


            let questions = nextProps.questions;
            for (let question of questions.entities) {
                if (colorTag[question.id] === undefined) {
                    colorTag[question.id] = color[Math.floor(Math.random() * color.length)];
                }

                question.period = moment(question.from).format("MMM Do") + ' - ' + moment(question.to).format("MMM Do YYYY");
                question.colorTag = colorTag[question.id];
                question.avatarChar = question.createdBy.substr(0, 1);
            }

            reactLocalStorage.setObject('colorTag', colorTag);
            let {pagination} = this.state;
            console.log(pagination)
            this.setState({
                pagination: {
                    pageSize: questions.pageSize,
                    current: questions.pageIndex + 1,
                    pageIndex: questions.pageIndex,
                    total: questions.count,
                    orders: [['createdAt', 'desc']],
                    code: pagination.code
                }
            })

            this.setState({questions: questions})

            dispatch(questionActions.clear());

        }


    }

    paginationChange = (page) => {
        let {pagination} = this.state;
        pagination.pageIndex = page - 1;
        pagination.current = page;
        this.setState({pagination: pagination});
        this.props.dispatch(questionActions.getAll(this.state.pagination));
    }

    handleSearch = (value) => {
        let {pagination} = this.state;
        console.log(pagination);
        pagination.code = value;
        this.setState({pagination: pagination});
        this.props.dispatch(questionActions.getAll(this.state.pagination));

    }

    handleSubmit = (e) => {
        e.preventDefault();
        // call update question
        this.props.dispatch(questionActions.update(this.state.question));


    }

    handleClickActionItem = (id, action) => {
        let {entities} = this.state.questions
        let question = entities.find(x => x.id === id)
        if(question.status ===0){
            question.approved = false;
        }else{
            question.approved = true;
        }
        this.setState({question: question});
        switch (action) {
            case 'edit':
                this.setState({edit: true})

                break
            case 'delete':
                break
            default:
        }

    }


    renderEdit = (item, IconText) => {
        return (
            <IconText
                id={item.id}
                value='disliked'
                action='edit'
            />
        );


    }

    renderDelete = (item, IconText) => {
        return (
            <IconText
                id={item.id}
                value='disliked'
                action='delete'
            />
        );


    }


    render() {

        const IconText = ({text, id, action}) => (
            <span
                onClick={e => {
                    this.handleClickActionItem(id, action);
                }}

            >
                <Icon type={action} style={{marginRight: 8}}/>
                {text}
            </span>
        );


        const QuestionDetail = ({liked, disliked, created_at, content, status}) => (
            <span>
                <ul className="ant-list-item-action" style={{marginLeft: '0px'}}>
                    <li>
                        <span>
                            <i className="anticon anticon-like-o" style={{marginRight: '8px'}}></i>
                            {liked | 0}</span>
                        <em className="ant-list-item-action-split"></em>
                    </li>
                    <li>
                        <span>
                            <i className="anticon anticon-dislike-o" style={{marginRight: '8px'}}></i>
                            {disliked | 0}</span>
                        <em className="ant-list-item-action-split"></em>
                    </li>
                    <li>
                        <span>
                            <i className="anticon anticon-calendar" style={{marginRight: '8px'}}></i>

                            <Moment format="dddd, MMM Do hh:mm A">{created_at}</Moment></span>

                    </li>

                </ul>
                <h3>{content}</h3>
                {status ===0? <p style={{}}><em> waiting for approval</em></p>:''}

            </span>
        );

        const {getFieldDecorator} = this.props.form;

        return (
            <div>
                <Row gutter={16}>
                    <Col span={24}>
                        {!this.state.edit ?
                            <Card title={<h2>{this.state.pagination.total + " Questions"}</h2>}
                                  extra={<Search
                                      placeholder="input code here"
                                      onSearch={value => this.handleSearch(value)}
                                      prefix='#'
                                      enterButton
                                      style={{width: 200}}
                                  />
                                  }
                                  style={{padding: '0 20px 0 20px'}}>
                                <List
                                    itemLayout="horizontal"
                                    size="large"
                                    pagination={Object.assign({}, this.state.pagination, {
                                        onChange: page => this.paginationChange(page)
                                    })}
                                    dataSource={this.state.questions.entities}
                                    renderItem={item => (
                                        <List.Item
                                            key={item.id}
                                            actions={[
                                                this.renderEdit(item, IconText), this.renderDelete(item, IconText)
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar style={{
                                                        color: '#ffffff',
                                                        backgroundColor: item.colorTag,
                                                    }}>{item.createdBy.substr(0, 1)}</Avatar>

                                                }
                                                title={<div>{item.createdBy}</div>}
                                                description={<QuestionDetail content={item.content}
                                                                             created_at={item.createdAt}
                                                                             liked={item.liked}
                                                                             status={item.status}
                                                                             disliked={item.disliked}/>}
                                            />


                                        </List.Item>
                                    )}
                                />
                            </Card>
                            :
                            <Card title="Edit Question" extra={<div><Icon style={{cursor:'pointer'}} onClick={(e)=>{this.setState({edit:false})}} type="close" /> </div>} style={{padding: '0 20px 0 20px'}}>

                                <Form onSubmit={this.handleSubmit} className="event-form">
                                    <FormItem>
                                        <p>{"Event #" + this.state.question.Event.code}</p>
                                    </FormItem>
                                    <FormItem>

                                        <Input.TextArea
                                            value={this.state.question.content}
                                            onChange={event => {
                                                this.setState({
                                                    question: Object.assign({}, this.state.question, {
                                                        content: event.target.value
                                                    })
                                                })
                                            }}
                                            rows={4} placeholder="Type your question"/>
                                    </FormItem>

                                    <FormItem>
                                        <div>
                                            <ul className="ant-list-item-action" style={{marginLeft: '0px'}}>
                                                <li>
                                                    <span>
                                                        <i className="anticon anticon-like-o" style={{marginRight: '8px'}}></i>
                                                        {this.state.question.liked | 0} </span>
                                                    <em className="ant-list-item-action-split"></em>
                                                </li>
                                                <li>
                                                    <span>
                                                        <i className="anticon anticon-dislike-o" style={{marginRight: '8px'}}></i>
                                                        {this.state.question.disliked | 0} </span>
                                                    <em className="ant-list-item-action-split"></em>
                                                </li>
                                                <li>
                                                    <span>
                                                        <i className="anticon anticon-calendar" style={{marginRight: '8px'}}></i>

                                                        <Moment format="dddd, MMM Do hh:mm A">{this.state.question.createdAt}</Moment>
                                                    </span>

                                                </li>

                                            </ul>
                                        </div>

                                    </FormItem>
                                    <FormItem>
                                              <span>
                                                <Rate count={3} onChange={(value)=>{
                                                    this.setState({question:
                                                        Object.assign({}, this.state.question, {
                                                            rating:value
                                                    })
                                                    })
                                                }} value={this.state.question.rating} />
                                                {this.state.question.rating && <span className="ant-rate-text">{this.state.question.rating} stars</span>}
                                              </span>


                                    </FormItem>
                                    <FormItem>
                                        <Checkbox
                                            checked={this.state.question.approved}

                                            onChange={(e) =>{
                                                this.setState({
                                                    question:Object.assign({}, this.state.question, {
                                                        approved: e.target.checked,
                                                        status:e.target.checked?1:0
                                                    })
                                                });

                                            }}

                                        >Approval</Checkbox>
                                    </FormItem>
                                    <FormItem>
                                        <Row>
                                            <Col span={24}>
                                                <Button style={{float: 'right'}} type="primary" htmlType="submit">
                                                    Save
                                                </Button>
                                            </Col>
                                        </Row>
                                    </FormItem>
                                </Form>
                            </Card>
                        }
                    </Col>


                </Row>
            </div>

        );
    }
}

function mapStateToProps(state) {
    const {questions} = state;
    return questions;
}

const WrappedNormalLoginForm = Form.create()(QuestionPage);
const connectedHomePage = connect(mapStateToProps)(WrappedNormalLoginForm);
export {connectedHomePage as QuestionPage};