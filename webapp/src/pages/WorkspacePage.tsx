import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router'
import { AppState } from '../store'
import { getWorkspaceByName, application, getSubscription } from '../store/application/selectors';
import { connect } from 'react-redux'
import NotFound from './NotFound';
import ProjectPage from './ProjectPage';
import KanbanBoardPage from './KanbanBoardPage';
import Header from '../components/Header';
import { IApplication } from '../store/application/types';
import { loadProjects } from '../store/projects/actions';
import { projects } from '../store/projects/selectors';
import { IProject } from '../store/projects/types';
import { IKanbanBoard } from '../store/kanbanboard/types'
import { Route, Switch, Redirect, Link } from 'react-router-dom'
import ProjectsPage from './ProjectsPage';
import { API_GET_KANBANBOARDS, API_GET_PROJECTS } from '../api'
import WorkspaceSettingsPage from './WorkspaceSettingsPage';
import { daysBetween, subIsInactive, subIsTrial } from '../core/misc';
import SubscriptionPage from './SubscriptionPage';
import { kanbanBoards } from '../store/kanbanboard/selectors';
import { loadKanbanBoards } from '../store/kanbanboard/actions';

const mapStateToProps = (state: AppState) => ({
    application: application(state),
    projects: projects(state),
    kanbanBoards: kanbanBoards(state)
})

const mapDispatchToProps = {
    loadProjects: loadProjects,
    loadKanbanBoards: loadKanbanBoards
}

interface PropsFromState {
    application: IApplication
    projects: IProject[]
    kanbanboards: IKanbanBoard[]
}
interface RouterProps extends RouteComponentProps<{
    workspaceName: string
}> { }
interface PropsFromDispatch {
    //loadProjectsRequest: typeof loadProjectsRequest
    loadProjects: typeof loadProjects
    loadKanbanBoards: typeof loadKanbanBoards
}
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    loadingProjects: boolean
    loadingBoards: boolean
    notFound: boolean
}

class WorkspacePage extends Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            loadingProjects: true,
            loadingBoards: true,
            notFound: false
        }
    }

    componentDidMount() {
        const { workspaceName } = this.props.match.params
        const ws = getWorkspaceByName(this.props.application, workspaceName)

        if (!ws) this.setState({ notFound: true })

        if (ws) {
            API_GET_PROJECTS(ws.id)
                .then(response => {
                    if (response.ok) {
                        response.json().then((data: IProject[]) => {
                            this.props.loadProjects(data)
                            this.setState({ loadingProjects: false })
                        })
                    }
                }
                )
            API_GET_KANBANBOARDS(ws.id)
                .then(response => {
                    if (response.ok) {
                        response.json().then((data: IKanbanBoard[]) => {
                            this.props.loadKanbanBoards(data)
                            this.setState({ loadingBoards: false })
                        })
                    }

                })

        }
    }

    render() {
        const { workspaceName } = this.props.match.params
        const ws = getWorkspaceByName(this.props.application, workspaceName)!
        const s = getSubscription(this.props.application, ws.id)

        return (
            this.state.notFound ?
                <div><Redirect to="/" /></div>
                :
                (this.state.loadingProjects || this.state.loadingBoards) ?
                    <div className="p-2">Loading data...</div>
                    :
                    (
                        <div>
                            <div>
                                <Header account={this.props.application.account!} workspaceName={workspaceName} />
                                {subIsInactive(s) && <div className="bg-yellow-300 p-2">The plan of this workspace is <b>inactive</b>. It is not possible to create or edit projects. If you are an owner you can manage workspace plans <Link className="link" to={"/" + workspaceName + "/settings"}>here</Link>.</div>}
                                {subIsTrial(s) && !subIsInactive(s) && daysBetween(new Date(s.expirationDate), new Date()) < 6 && <div className="bg-yellow-300 p-2">This workspace is running on a free trial. The trial will end {daysBetween(new Date(s.expirationDate), new Date()) === 0 ? <b>today</b> : "in " + daysBetween(new Date(s.expirationDate), new Date()) + " days"}. If you are an owner you can sign up for a paid plan <Link className="link" to={"/" + workspaceName + "/subscription"}>here</Link>.</div>}

                                <Switch>
                                    <Route exact strict path={this.props.match.path} component={ProjectsPage} />
                                    <Route exact strict path={this.props.match.path + "/settings"} component={WorkspaceSettingsPage} />
                                    <Route exact strict path={this.props.match.path + "/subscription"} component={SubscriptionPage} />
                                    <Route strict path={this.props.match.path + "/projects/:projectId"} component={ProjectPage} />
                                    <Route strict path={this.props.match.path + "/kanban/:boardId"} component={KanbanBoardPage} />
                                    <Route path={this.props.match.path} component={NotFound} />
                                </Switch>
                            </div>
                        </div>
                    )
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkspacePage)