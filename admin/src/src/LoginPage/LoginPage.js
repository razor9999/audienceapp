import React from 'react';
import {connect} from 'react-redux';
import {Layout,Row,Col, Form, Icon, Input, Button} from 'antd';
import {userActions} from '../_actions';
import './LoginPage.css'

const FormItem = Form.Item;

class LoginPage extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            username: '',
            password: '',
            submitted: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillMount() {
        // reset login status
        this.props.dispatch(userActions.logout());

    }




    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({submitted: true});
                this.setState({
                    username: values.username,
                    password: values.password,
                })

                const {dispatch} = this.props;
                if (values.username && values.password) {
                    dispatch(userActions.login(values.username, values.password));
                }
            }
        });


    }

    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <Layout>
                <div className='bg'>
                    <div style={{margin: 200}}>
                        <Row>
                            <Col span={8} offset={8}>
                                <h1 style={{color: '#ffffff'}}>Audience Interaction Made Easy.</h1>
                                <h5 style={{color: '#ffffff'}}>Live Q&A and Polls for your Meetings & Events
                                </h5>

                                <Form name="form" className="login-form" onSubmit={this.handleSubmit}>
                                    <FormItem>
                                        {getFieldDecorator('username', {
                                            rules: [{required: true, message: 'Please input your username!'}],
                                        })(
                                            <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                                   placeholder="Username"/>
                                        )}

                                    </FormItem>

                                    <FormItem>
                                        {getFieldDecorator('password', {
                                            rules: [{required: true, message: 'Please input your Password!'}],
                                        })(
                                            <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                                   type="password" placeholder="Password"/>
                                        )}
                                    </FormItem>
                                    <FormItem>

                                        <Button type="primary" htmlType="submit" className="login-form-button">
                                            Log in
                                        </Button>
                                    </FormItem>

                                </Form>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Layout>
        );
    }
}

function mapStateToProps(state) {
    const {loggingIn} = state.authentication;
    return {
        loggingIn
    };
}
const WrappedNormalLoginForm = Form.create()(LoginPage);

const connectedLoginPage = connect(mapStateToProps)(WrappedNormalLoginForm);

export {connectedLoginPage as LoginPage};


