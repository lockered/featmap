import { IApplication } from '../store/application/types';
import { moveSwimlane } from '../store/swimlane/actions';
import { AppState } from '../store'
import { application } from '../store/application/selectors';
import React, { Component } from 'react';
import { connect } from 'react-redux'
import { ISwimlane } from '../store/swimlane/types';
import { swimlanes } from '../store/swimlane/selectors';
import { Button } from './elements';


interface SelfProps {
    boardId : string
    workspaceId : string
    swimlanes: ISwimlane[]
}

interface PropsFromState {
    application: IApplication
}

interface PropsFromDispatch {
    moveSwimlane: typeof moveSwimlane
}

interface State {
    showCreateSwimlane : boolean
}

const mapStateToProps = (state: AppState) => ({
    application: application(state)
  })

  const mapDispatchToProps = {
    moveSwimlane
  }

  type Props = PropsFromState & PropsFromDispatch & SelfProps  

  class KanbanBoard extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { 
            showCreateSwimlane: false
        }
    }

    render() {
        const { boardId, moveSwimlane } = this.props
        const isEmpty = swimlanes.length  === 0

        return (
            <div className="z-0   ">
            { isEmpty ?
            <div className={"p-2"}>
                <p>
                    <Button primary title="Add swimlane" icon="add" noborder handleOnClick={() => this.setState({ showCreateSwimlane: true })} />
                </p>
                <p>
                    This board is empty, please start by adding a <b>swimlane</b>.
                </p>
            </div>

            :
            <div className={"p-2"}>
                Don't know what to do at the moment... :-)
            </div>

            }
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(KanbanBoard)