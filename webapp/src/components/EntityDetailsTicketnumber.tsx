import React, { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../store'
import { updateWorkflow } from '../store/workflows/actions';
import { Formik, FormikHelpers as FormikActions, FormikProps, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { application } from '../store/application/selectors';
import { IApplication } from '../store/application/types';
import { IWorkflow } from '../store/workflows/types';
import onClickOutside from "react-onclickoutside";
import { Button } from './elements';
import { API_UPDATE_WORKFLOW_TICKETNUMBER } from "../api";

const mapStateToProps = (state: AppState) => ({
    application: application(state)
})

const mapDispatchToProps = {
    updateWorkflow,
}

interface PropsFromState {
    application: IApplication
}

interface PropsFromDispatch {
    updateWorkflow: typeof updateWorkflow
}


interface SelfProps {
    entity: IWorkflow
    app: IApplication
    url: string
    close: () => void
    viewOnly: boolean
}
type Props = PropsFromState & PropsFromDispatch & SelfProps


interface State {
    edit: boolean
}


class EntityDetailsTicketnumber extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.submitForm = () => { }

        this.state = { edit: false }
    }


    handleClickOutside = () => {
        if (this.state.edit) {
            this.setState({ edit: false })
            this.submitForm()
        }
    }

    submitForm: () => void;

    render() {
        let closed = false
        switch (this.props.entity.kind) {
            case "workflow":{
                closed = this.props.entity.status === "CLOSED"
                break;
            }
            default:
                break;
        }

        return (
            <div className=" self-start w-full mb-4 " >

                <Formik
                    initialValues={{ ticketnumber: this.props.entity.description }}

                    validationSchema={Yup.object().shape({
                        ticketnumber: Yup.string()
                            .max(64, 'Maximum 64 characters.')
                    })}

                    onSubmit={(values: { ticketnumber: string }, actions: FormikActions<{ ticketnumber: string }>) => {

                        switch (this.props.entity.kind) {

                            case "workflow": {
                                const optimistic: IWorkflow = this.props.entity
                                optimistic.ticketnumber = values.ticketnumber
                                optimistic.lastModified = new Date().toISOString()
                                optimistic.lastModifiedByName = this.props.app.account === undefined ? "demo" : this.props.app.account!.name

                                this.props.updateWorkflow(optimistic)

                                    API_UPDATE_WORKFLOW_TICKETNUMBER(this.props.entity.workspaceId, this.props.entity.id, values.ticketnumber)
                                        .then(response => {
                                            if (response.ok) {
                                                response.json().then((data: IWorkflow) => {
                                                    this.props.updateWorkflow(data)
                                                }
                                                )
                                            } else {
                                                alert("Something went wrong when updating description.")
                                            }
                                        }
                                        )

                                break;
                            }
                            default:
                                break;
                        }

                        this.setState({ edit: false })
                        actions.setSubmitting(false)
                    }}
                >
                    {(formikBag: FormikProps<{ ticketnumber: string }>) => {

                        this.submitForm = formikBag.submitForm

                        return (
                            <Form  >
                                {formikBag.status && formikBag.status.msg && <div>{formikBag.status.msg}</div>}

                                {this.state.edit ?
                                    <Field
                                        name="description"
                                    >
                                        {({ form }: FieldProps<{ ticketnumber: string }>) => (
                                            <div className="flex flex-col mt-1 ">
                                                <div >
                                                    <input autoFocus value={form.values.description} onChange={form.handleChange} placeholder="Ticketnumber" id="ticketnumber" className="rounded p-2  border w-full  	" />
                                                </div>
                                                <div className="p-1 text-red-500 text-xs font-bold">{form.touched.ticketnumber && form.errors.ticketnumber}</div>
                                            </div>
                                        )}
                                    </Field>
                                    :
                                    <div className=" mt-2 ml-2 border border-white  ">
                                        <div>
                                            {this.props.entity.ticketnumber.length === 0 ? (
                                                <div>
                                                    <em>No ticket.</em>
                                                    {!(this.props.viewOnly || closed) && <Button noborder icon="edit" handleOnClick={() => this.setState({ edit: true })} />}
                                                </div>)
                                                :
                                                <div>
                                                            <div className="text-center overflow-auto font-medium items-center">
                                                                <a rel="noopener noreferrer" target="_blank" href={this.props.application.zillaBaseLink+this.props.entity.ticketnumber}>Ticket: {this.props.entity.ticketnumber}</a>
                                                                {!(this.props.viewOnly || closed) && <Button noborder icon="edit" handleOnClick={() => this.setState({ edit: true })} />}
                                                            </div>
                                                </div>
                                            }
                                        </div>

                                    </div>
                                }
                            </Form>
                        )
                    }}
                </Formik>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(onClickOutside(EntityDetailsTicketnumber))