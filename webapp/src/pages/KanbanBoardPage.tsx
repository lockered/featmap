import React, { Component } from 'react';
import EntityDetailsPage from './EntityDetailsPage';
import { RouteComponentProps } from 'react-router'
import { Route, Switch, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { AppState } from '../store'
import { API_GET_KANBANBOARD, API_GET_KANBANBOARD_RESP } from '../api';
import { application, getWorkspaceByName } from '../store/application/selectors';
import { kanbanBoards, getKanbanBoardById } from '../store/kanbanboard/selectors'
import { loadKanbanBoards } from '../store/kanbanboard/actions'
import { loadSwimlanes} from '../store/swimlane/actions'
import { IKanbanBoard } from '../store/kanbanboard/types';
import { IApplication } from '../store/application/types'
import { ISwimlane } from '../store/swimlane/types';
import { filterSwimlanesOnBoard, swimlanes } from '../store/swimlane/selectors';
import Kanbanboard from '../components/Kanbanboard';

const mapStateToProps = (state: AppState) => ({
    application: application(state),
    kanbanBoards: kanbanBoards(state),
    swimlanes: swimlanes(state),
})

const mapDispatchToProps = {
    loadKanbanBoards,
    loadSwimlanes,
}

interface PropsFromState {
    application: IApplication
    kanbanBoards: IKanbanBoard[]
    swimlanes: ISwimlane[]
}

interface RouterProps extends RouteComponentProps<{
    workspaceName: string
    boardId: string
}> { }

interface PropsFromDispatch {
    loadKanbanBoards: typeof loadKanbanBoards
    loadSwimlanes: typeof loadSwimlanes
}

interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps


interface State {
    boardFound: boolean
    loading: boolean
    newBoard: boolean
}

class KanbanBoardPage extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            boardFound: false,
            loading: true,
            newBoard: false
        }
    }

    componentDidMount() {
        const { workspaceName, boardId } = this.props.match.params
        const board = getKanbanBoardById(this.props.kanbanBoards, boardId)
        const ws = getWorkspaceByName(this.props.application, workspaceName)!


        if (board) {

            API_GET_KANBANBOARD(ws.id,boardId)
                .then(response => {
                    if (response.ok) {
                        response.json().then((data: API_GET_KANBANBOARD_RESP) => {
                        this.props.loadSwimlanes(data.swimlanes)
//                            this.props.loadFeatureComments(data.featureComments)
                            this.setState({ loading: false })
                        })
                    }

            })
        } 
        if (board) this.setState({ boardFound: true })
    }

    componentDidUpdate() {
        const { boardId } = this.props.match.params
        const board = getKanbanBoardById(this.props.kanbanBoards, boardId)!
    }

    render() {
        const { boardId, workspaceName } = this.props.match.params
        const ws = getWorkspaceByName(this.props.application, workspaceName)!
        const board = getKanbanBoardById(this.props.kanbanBoards,boardId)!
        

        return (
            board ?
                this.state.loading ?
                    <div className="p-2">Loading data...</div>
                    :
                    <div className="overflow-x-auto">
                        <div className="flex flex-row p-2 ">
                            <div className="flex"><span className="font-semibold">{board.title}</span></div>
                        </div>
                        <div className="flex items-center">
                            <div className="ml-4"><Link to={this.props.match.url + "/b/" + this.props.match.params.boardId}><i className="material-icons text-gray-600">settings</i></Link></div>
                        </div>
                        <Kanbanboard 
                            boardId = {boardId}
                            workspaceId={ws.id}
                            swimlanes = {filterSwimlanesOnBoard(this.props.swimlanes, boardId)}
                        />

                        <Switch>
                            <Route exact path="/" component={() => null} />
                            <Route exact path={this.props.match.path + "/b/:boardId2"} component={EntityDetailsPage} />
                        </Switch>
                    </div>
            : <div>Board not found</div>
        )

    }

}

export default connect(mapStateToProps, mapDispatchToProps)(KanbanBoardPage)