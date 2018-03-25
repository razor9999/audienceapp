import React from 'react';
import {connect} from 'react-redux';
import { Row, Col, Form, Icon, Input, Button, DatePicker, List, Avatar, Card, message} from 'antd';
import './EventPage.css'
import {eventActions} from "../_actions";
import moment from 'moment';
import Moment from 'react-moment';
import {eventConstants} from "../_constants";

const { RangePicker} = DatePicker;
const FormItem = Form.Item;
const dateFormat = 'YYYY/MM/DD';

class EventPage extends React.PureComponent {

    constructor(props) {
        super(props);
        //Khởi tạo state,
        this.state = {
            event: {},
            events: {
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

        this.state.events.entities.push({
            id: 1,
            code: `ant design part `,
            description: 'Ant Design, a  by Ant UED Team.',
            from: '2018-01-01',
            to: '2018-02-10'
        });
        this.state = Object.assign({}, this.state, {
            pagination: {
                pageSize: 5,
                current: 1,
                pageIndex:0,
                total: 0,
                orders: [['createdAt', 'desc']],

            }
        })
        this.paginationChange = this.paginationChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this);

    }


    componentWillMount() {

        this.props.dispatch(eventActions.getAll(this.state.pagination));

    }

    componentWillReceiveProps(nextProps) {
        console.log(1, nextProps)
        const {dispatch} = this.props;

        if (nextProps.behavior === eventConstants.CREATE_SUCCESS) {
            console.log('nextprops', nextProps.event)
            this.setState({event: nextProps.event})
           // dispatch(eventActions.clear());
            dispatch(eventActions.getAll(this.state.pagination));
            message.success('the event #'+nextProps.event.code+' has been created.');


        }


        if (nextProps.behavior === eventConstants.GETALL_SUCCESS) {
            console.log('nextprops', nextProps.events)

            let events = nextProps.events;
            for (let event of events.entities) {
                event.period =  moment(event.from).format("MMM Do")+' - '+moment(event.to).format("MMM Do YYYY");
            }
            this.setState({
                pagination: {
                    pageSize: events.pageSize,
                    current: events.pageIndex + 1,
                    pageIndex:events.pageIndex,
                    total: events.count,
                    orders: [['createdAt', 'desc']],

                }
            })

            this.setState({events: events})

            dispatch(eventActions.clear());

        }


    }

    paginationChange(page) {
        let {pagination} = this.state;
        pagination.pageIndex =page-1;
        pagination.current = page;
        this.setState({pagination:pagination});
        this.props.dispatch(eventActions.getAll(this.state.pagination));
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                const {dispatch} = this.props;
                if (values.code && values.period) {
                    let {0: from, 1: to} = values.period;
                    dispatch(eventActions.create(values.code, from.format("YYYY-MM-DD"), to.format("YYYY-MM-DD"), values.title));
                }

            }
        });


    }

    render() {

        const IconText = ({type, text}) => (
            <span>
                <Icon type={type} style={{marginRight: 8}}/>
                {text}
            </span>
        );

        const {getFieldDecorator} = this.props.form;
        return (
            <div>
                <Row gutter={16}>
                    <Col span={16}>
                        <Card title={<h2>{this.state.pagination.total+" Events"}</h2>} style={{padding: '0 20px 0 20px'}}>


                            <List
                                itemLayout="vertical"
                                size="large"
                                pagination={Object.assign({}, this.state.pagination, {
                                    onChange: page => this.paginationChange(page)
                                })}
                                dataSource={this.state.events.entities}
                                renderItem={item => (
                                    <List.Item
                                        key={item.id}
                                        actions={[
                                            <IconText type="calendar" text={item.period}/>]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar style={{
                                                    color: '#ffffff',
                                                }}>

                                                    {item.code.substring(0, 1).toUpperCase()}</Avatar>

                                            }
                                            title={"#"+item.code}
                                            description={<Moment format="dddd, MMM Do hh:mm A">{item.createdAt}</Moment>}
                                        />

                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title={<h2>Add Events</h2>} style={{padding: '0 20px 0 20px'}}>

                            <Form onSubmit={this.handleSubmit} className="event-form">
                                <FormItem>
                                    {getFieldDecorator('code', {
                                        rules: [{required: true, message: 'Please input code!'}],
                                    })(
                                        <Input prefix='#'
                                               placeholder="Code"/>
                                    )}
                                </FormItem>

                                <FormItem>
                                    {getFieldDecorator('period', {
                                        rules: [{required: true, message: 'Please select period!'}],
                                        initialValue: [moment(new Date(), dateFormat), moment(moment(new Date()).add('days', 5), dateFormat)]
                                    })(
                                        <RangePicker style={{}}
                                                     format={dateFormat}
                                        />
                                    )}


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

                    </Col>
                </Row>
            </div>

        );
    }
}

function mapStateToProps(state) {
    const {events} = state;
    return events;
}

const WrappedNormalLoginForm = Form.create()(EventPage);
const connectedHomePage = connect(mapStateToProps)(WrappedNormalLoginForm);
export {connectedHomePage as EventPage};