import React, { Component } from 'react';
import Board from '../components/Board';
import EntityDetailsPage from './EntityDetailsPage';
import { application, getWorkspaceByName, getMembership, getSubscription } from '../store/application/selectors';
import { projects, getProjectById } from '../store/projects/selectors';
import { RouteComponentProps } from 'react-router'
import { Route, Switch, Link } from 'react-router-dom'
import { IProject } from '../store/projects/types';
import { loadMilestones } from '../store/milestones/actions';
import { loadWorkflows } from '../store/workflows/actions';
import { milestones, filterMilestonesOnProject } from '../store/milestones/selectors';
import { AppState } from '../store'
import { connect } from 'react-redux'
import { API_GET_PROJECT, API_GET_PROJECT_RESP } from '../api';
import { IApplication } from '../store/application/types';
import { IMilestone } from '../store/milestones/types';
import { features, filterFeaturesOnMilestoneAndSubWorkflow } from '../store/features/selectors';
import { filterOutClosedWorkflows, filterWorkflowsOnProject } from '../store/workflows/selectors';
import { subWorkflows, getSubWorkflowByWorkflow } from '../store/subworkflows/selectors';
import { ISubWorkflow } from '../store/subworkflows/types';
import { workflows } from '../store/workflows/selectors';
import { IWorkflow } from '../store/workflows/types';
import { loadSubWorkflows } from '../store/subworkflows/actions';
import { loadFeatures } from '../store/features/actions';
import { loadPersonas } from '../store/personas/actions';
import { loadWorkflowPersonas } from '../store/workflowpersonas/actions';
import { loadFeatureComments } from '../store/featurecomments/actions';
import { IFeature } from '../store/features/types';
import { isEditor, subIsInactive, subIsTrial, subIsBasicOrAbove, CardStatus } from '../core/misc';
import { Button } from '../components/elements';
import queryString from 'query-string'
import { featureComments, filterFeatureCommentsOnProject } from '../store/featurecomments/selectors';
import { IFeatureComment } from '../store/featurecomments/types';
import ContextMenu from '../components/ContextMenu';
import { workflowPersonas, filterWorkflowPersonasOnProject, filterWorkflowPersonasOnWorkflow } from '../store/workflowpersonas/selectors';
import { personas, filterPersonasOnProject } from '../store/personas/selectors';
import { IPersona } from '../store/personas/types';
import { IWorkflowPersona } from '../store/workflowpersonas/types';
import { convertMarkDownStringToWiki, convertMarkDownStringToAdoc } from '../tools/converter';

const mapStateToProps = (state: AppState) => ({
    application: application(state),
    projects: projects(state),
    milestones: milestones(state),
    subWorkflows: subWorkflows(state),
    workflows: workflows(state),
    features: features(state),
    featureComments: featureComments(state),
    personas: personas(state),
    workflowPersonas: workflowPersonas(state)
})

const mapDispatchToProps = {
    loadMilestones,
    loadWorkflows,
    loadSubWorkflows,
    loadFeatures,
    loadFeatureComments,
    loadPersonas,
    loadWorkflowPersonas
}

interface PropsFromState {
    application: IApplication
    projects: IProject[]
    milestones: IMilestone[]
    subWorkflows: ISubWorkflow[]
    workflows: IWorkflow[]
    features: IFeature[]
    featureComments: IFeatureComment[]
    personas: IPersona[]
    workflowPersonas: IWorkflowPersona[]
}
interface RouterProps extends RouteComponentProps<{
    workspaceName: string
    projectId: string
}> { }
interface PropsFromDispatch {
    loadMilestones: typeof loadMilestones
    loadWorkflows: typeof loadWorkflows
    loadSubWorkflows: typeof loadSubWorkflows
    loadFeatures: typeof loadFeatures
    loadFeatureComments: typeof loadFeatureComments
    loadPersonas: typeof loadPersonas
    loadWorkflowPersonas: typeof loadWorkflowPersonas
}
interface SelfProps { }
type Props = RouterProps & PropsFromState & PropsFromDispatch & SelfProps

interface State {
    projectFound: boolean
    loading: boolean
    showClosedMilstones: boolean
    copySuccess: boolean
    demo: boolean
    showPersonas: boolean
}

class ProjectPage extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            projectFound: false,
            loading: true,
            showClosedMilstones: false,
            copySuccess: false,
            demo: false,
            showPersonas: false
        }
    }

    componentDidMount() {
        const { projectId, workspaceName } = this.props.match.params
        const p = getProjectById(this.props.projects, projectId)
        const ws = getWorkspaceByName(this.props.application, workspaceName)!

        if (p) {

            API_GET_PROJECT(ws.id, p.id)
                .then(response => {
                    if (response.ok) {
                        response.json().then((data: API_GET_PROJECT_RESP) => {
                            this.props.loadMilestones(data.milestones)
                            this.props.loadWorkflows(data.workflows)
                            this.props.loadSubWorkflows(data.subWorkflows)
                            this.props.loadFeatures(data.features)
                            this.props.loadFeatureComments(data.featureComments)
                            this.props.loadPersonas(data.personas)
                            this.props.loadWorkflowPersonas(data.workflowPersonas)
                            this.setState({ loading: false })
                        })
                    }

                })
        }
        if (p) this.setState({ projectFound: true })
    }

    componentDidUpdate() {
        const { projectId } = this.props.match.params
        const proj = getProjectById(this.props.projects, projectId)!

        if (!proj) {
            this.props.history.push("/" + this.props.match.params.workspaceName)
        }

        const values = queryString.parse(this.props.location.search)
        const demo = values.demo as string
        if (demo === "1") this.setState({ demo: true })

    }

    fixedEncodeURIComponent = (str: string): string => {
        return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
          return '%' + c.charCodeAt(0).toString(16);
        });
      }
      
    download = (filename: string, text: string) => {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + this.fixedEncodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    projectCSV = (): string => {

        var csv = `release_title,goal_title,activity_title,feature_title,feature_description,feature_status,feature_color,feature_annotations,feature_size\n`

        this.props.milestones.forEach(m =>
            this.props.workflows.forEach(w => {
                getSubWorkflowByWorkflow(this.props.subWorkflows, w.id).forEach(sw => {
                    filterFeaturesOnMilestoneAndSubWorkflow(this.props.features, m.id, sw.id).forEach(f => {
                        csv = csv + `"${m.title.replace(/"/g, '""',)}","${w.title.replace(/"/g, '""',)}","${sw.title.replace(/"/g, '""',)}","${f.title.replace(/"/g, '""',)}","${f.description.replace(/"/g, '""',)}","${f.status.replace(/"/g, '""',)}","${f.color.replace(/"/g, '""',)}","${f.annotations.replace(/"/g, '""',)}","${f.estimate.toString()}"\n`
                    })
                }
                )
            }
            )
        )
        return csv
    }

    replaceWhiteCardWithSilverClass = (color: string): string => {
        var endColor = (color === `WHITE` ? `SILVER` : color)

        return `| style="border: double ${endColor}; border-left: thick solid ${endColor};" `
    }


    private buildMarkdown() {
        var projectPart = `-----\n`;

        this.props.workflows.forEach(w => {
            projectPart = projectPart + `\n## ${w.title.toString()}  \n`;
            projectPart = projectPart + `${w.description.toString()}  \n`;
            getSubWorkflowByWorkflow(this.props.subWorkflows, w.id).forEach(sw => {
                // FIXME only output, when there are features in the current milestone
                projectPart = projectPart + `\n### ${sw.title.toString()}  \n`;
                projectPart = projectPart + `${sw.description.toString()}  \n`;
                this.props.milestones.forEach(m => {
                    var ifeature = filterFeaturesOnMilestoneAndSubWorkflow(this.props.features, m.id, sw.id);
                    ifeature.forEach(f => {
                        projectPart = projectPart + `\n#### ${f.title.toString()}  \n`;
                        if (f.description.length > 0) {
                            projectPart = projectPart + `${f.description.toString()}  \n`;
                        } else {
                            projectPart = projectPart + `  \n`;
                        }
                        if (f.estimate !== 0) {
                            projectPart = projectPart + `Storypoints: ${f.estimate.toFixed()} \n`;
                        }
                    });
                }
                );
            }
            );
        }
        );
        return projectPart;
    }

     projectJSON = (): string => {
/*
        const { projectId, workspaceName } = this.props.match.params
        const p = getProjectById(this.props.projects, projectId)
        const ws = getWorkspaceByName(this.props.application, workspaceName)!


        if(p) {
            const response = API_GET_PROJECT(ws.id, p.id)
            const project = (await response).json().then(project => {
                return project.toString()
            })
        }
*/
        if(this.props.application.zillaBaseLink) {
            return 'Zilla:'+ this.props.application.zillaBaseLink
        }
        return 'null'
    }

    projectWiki = (): string => {

        var columns = [1]; // milestones
        var columnindex = 1
        // append the neccessary columns per subworkflow
        this.props.workflows.forEach(w => {
            columns.push(getSubWorkflowByWorkflow(this.props.subWorkflows, w.id).length)
        })
        var wiki = `{| style = "border-style: solid; border-width: 1pt"\n`
            // milestone column
            wiki = wiki + `|\n`
                this.props.workflows.forEach(w => {
                    wiki = wiki + this.replaceWhiteCardWithSilverClass(w.color)
                    + `| '''[[#${w.title.toString()}|${w.title.toString()}]]'''\n`
                // all personas within the workflow
                var names = ``;
                filterWorkflowPersonasOnWorkflow(this.props.workflowPersonas, w.id).forEach(p => {
                        //find persona with a given id in the current workflow
                            var persona = this.props.personas.find(element => element.id === p.personaId)
                            names = names + `:${persona?.name.toString()} \n`
                    })
                // if personas exist add them to the goal
                if(names.length > 0){
                    wiki = wiki + `;Persona:\n`+names+`\n`
                }
                // add columns according to the subworkflows
                for(var i = 1;i<columns[columnindex];i++) {
                    wiki = wiki+ `|\n`
                }
                columnindex++
            })
            wiki = wiki + `|-\n`
            // now add the workflows
            // milestone column
            wiki = wiki + `|\n`
            this.props.workflows.forEach(w => {
                var subworkflows = getSubWorkflowByWorkflow(this.props.subWorkflows, w.id)
                if(subworkflows.length>0){
                    subworkflows.forEach(sw => {
                        wiki = wiki + this.replaceWhiteCardWithSilverClass(sw.color)
                        +`|\n''${sw.title.toString()}''\n`
                    })
                } else
                {
                    // add column for missing subworkflow
                    wiki = wiki + `|\n`
                }
            })
            wiki = wiki + `|-\n`
            this.props.milestones.forEach(m => {
            // and now begin to add the features
            // first column of the first feature line is the milestone
            // TODO introduce a flag for the first line after milestonechange
            var numberOfFeaturesPerColumn=[milestones.length]
            // try to calculate the maximum number of feature lines in the milestones!!!
            // start after the milestone
            var rowindex=0
            var maxfeatures = 0
            this.props.workflows.forEach(w => {
                    getSubWorkflowByWorkflow(this.props.subWorkflows, w.id).forEach(sw => {
                        // remember the number of subworkflows aka features
                        numberOfFeaturesPerColumn.push(filterFeaturesOnMilestoneAndSubWorkflow(this.props.features, m.id, sw.id).length)
                        // calculate maximum number of features
                        maxfeatures = (maxfeatures < numberOfFeaturesPerColumn[numberOfFeaturesPerColumn.length-1])
                                         ? numberOfFeaturesPerColumn[numberOfFeaturesPerColumn.length-1] :maxfeatures 
                    })
                    rowindex++
            })
            // we are in column 1 starting with 0!
            for(rowindex=0; rowindex < maxfeatures; rowindex++)
            {
                columnindex=1
                if(rowindex===0) {
                    // TODO add an empty line before the milestone
                    // add the milestonecolumn
                    wiki = wiki + this.replaceWhiteCardWithSilverClass(m.color) 
                    + `| ${m.title.toString()}\n`
                } else {
                    // else empty column
                    wiki = wiki + `|\n`
                }
                this.props.workflows.forEach(w => {
                        var subworkflows = getSubWorkflowByWorkflow(this.props.subWorkflows, w.id)
                        if(subworkflows.length>0) 
                        {
                            subworkflows.forEach(sw => {
                                // if the columns are empty write an empty column
                                if(numberOfFeaturesPerColumn[columnindex++]<=rowindex)
                                {
                                    wiki = wiki + `|\n`
                                } else
                                {
                                    var features = filterFeaturesOnMilestoneAndSubWorkflow(this.props.features, m.id, sw.id)
                                    wiki = wiki + this.replaceWhiteCardWithSilverClass(features[rowindex].color) 
                                    + `| ${features[rowindex].title.toString()+'('+features[rowindex].estimate+`)`}\n`
                                }
                            })
                        } else
                        { // add empty feature in column with missing subworkflow
                            wiki = wiki + `|\n`                            
                        }
                })
                // end of line
                wiki = wiki + `|-\n`
            }
        })
        // end of table
        wiki = wiki + `|}\n`

        return wiki + convertMarkDownStringToWiki(this.buildMarkdown())
    }

    projectAsciiDoc = (): string => {
        return convertMarkDownStringToAdoc(this.buildMarkdown())
    }

    projectMarkdown = (): string => {
        return this.buildMarkdown();
    }

    storyMapWiki = (): string => {

        var columns = [1]; // milestones
        var columnindex = 1
        // append the neccessary columns per subworkflow
        filterOutClosedWorkflows(this.props.workflows).forEach(w => {
                columns.push(getSubWorkflowByWorkflow(this.props.subWorkflows, w.id).length)
        })
        var wiki = `{| style = "border-style: solid; border-width: 1pt"\n`
            // milestone column
            wiki = wiki + `|\n`
            filterOutClosedWorkflows(this.props.workflows).forEach(w => { 
                    wiki = wiki + this.replaceWhiteCardWithSilverClass(w.color)
                                    + `| '''${w.title.toString()}'''\n`
                    // all personas within the workflow
                    var names = ``;
                    filterWorkflowPersonasOnWorkflow(this.props.workflowPersonas, w.id).forEach(p => {
                            //find persona with a given id in the current workflow
                                var persona = this.props.personas.find(element => element.id === p.personaId)
                                names = names + `:${persona?.name.toString()} \n`
                        })
                    // if personas exist add them to the goal
                    if(names.length > 0){
                        wiki = wiki + `;Persona:\n`+names+`\n`
                    }
                    // add columns according to the subworkflows
                        for(var i = 1;i<columns[columnindex];i++) {
                            wiki = wiki+ `|\n`
                        }
                    columnindex++
            })
            wiki = wiki + `|-\n`
            // now add the workflows
            // milestone column
            wiki = wiki + `|\n`
            filterOutClosedWorkflows(this.props.workflows).forEach(w => {
                    var subworkflows = getSubWorkflowByWorkflow(this.props.subWorkflows, w.id)
                    if(subworkflows.length>0) {
                        subworkflows.forEach(sw => {
                            wiki = wiki + this.replaceWhiteCardWithSilverClass(sw.color) 
                                        +`|\n''${sw.title.toString()}''\n`
                        })
                    } else
                    {
                        // add column for missing subworkflow
                        wiki = wiki + `|\n`
                    }
            })
            wiki = wiki + `|-\n`
            this.props.milestones.forEach(m => {
            // and now begin to add the features
            // first column of the first feature line is the milestone
            // TODO introduce a flag for the first line after milestonechange
            var numberOfFeaturesPerColumn=[milestones.length]
            // try to calculate the maximum number of feature lines in the milestones!!!
            // start after the milestone
            var rowindex=0
            var maxfeatures = 0
            filterOutClosedWorkflows(this.props.workflows).forEach(w => {
                    getSubWorkflowByWorkflow(this.props.subWorkflows, w.id).forEach(sw => {
                        // remember the number of subworkflows aka features
                        numberOfFeaturesPerColumn.push(filterFeaturesOnMilestoneAndSubWorkflow(this.props.features, m.id, sw.id).length)
                        // calculate maximum number of features
                        maxfeatures = (maxfeatures < numberOfFeaturesPerColumn[numberOfFeaturesPerColumn.length-1])
                                         ? numberOfFeaturesPerColumn[numberOfFeaturesPerColumn.length-1] :maxfeatures 
                    })
                    rowindex++
            })
            // we are in column 1 starting with 0!
            for(rowindex=0; rowindex < maxfeatures; rowindex++)
            {
                columnindex=1
                if(rowindex===0) {
                    // TODO add an empty line before the milestone
                    // add the milestonecolumn
                    wiki = wiki + this.replaceWhiteCardWithSilverClass(m.color)
                    +`| ${m.title.toString()}\n`
                } else {
                    // else empty column
                    wiki = wiki + `|\n`
                }
                filterOutClosedWorkflows(this.props.workflows).forEach(w => {
                        var subworkflows = getSubWorkflowByWorkflow(this.props.subWorkflows, w.id)
                        if(subworkflows.length>0) 
                        {
                            subworkflows.forEach(sw => {
                                // if the columns are empty add an empty column
                                if(numberOfFeaturesPerColumn[columnindex++]<=rowindex)
                                {
                                    wiki = wiki + `|\n`
                                } else
                                {
                                    var features = filterFeaturesOnMilestoneAndSubWorkflow(this.props.features, m.id, sw.id)
                                    if(features[rowindex].status === CardStatus.OPEN) {
                                        wiki = wiki + this.replaceWhiteCardWithSilverClass(features[rowindex].color)
                                                    + `| ${features[rowindex].title.toString()}\n`
                                    } else 
                                    {
                                        wiki = wiki + this.replaceWhiteCardWithSilverClass(features[rowindex].color)
                                                    + `| <s>${features[rowindex].title.toString()}</s>\n`

                                    }
                                }
                            })
                        } else
                        {  // add empty feature in column with missing subworkflow
                            wiki = wiki + `|\n`
                        }
                })
                wiki = wiki + `|-\n`
            }
        })
        wiki = wiki + `|}\n`
        return wiki
    }

    copyToClipboard = (url: string) => {
        const listener = (e: ClipboardEvent) => {
            e.clipboardData!.setData('text/plain', url);
            e.preventDefault();
        }

        document.addEventListener('copy', listener)
        document.execCommand('copy');
        document.removeEventListener('copy', listener);
        this.setState({ copySuccess: true })
    }

    urlRef = React.createRef<HTMLInputElement>()

    render() {
        const { projectId, workspaceName } = this.props.match.params
        const ws = getWorkspaceByName(this.props.application, workspaceName)!
        const proj = getProjectById(this.props.projects, projectId)!
        const member = getMembership(this.props.application, ws.id)
        const s = getSubscription(this.props.application, ws.id)

        const viewOnly = !isEditor(member.level) || subIsInactive(s)
        const showPrivateLink = !subIsInactive(s) && (subIsTrial(s) || subIsBasicOrAbove(s)) && ws.allowExternalSharing

        return (
            proj ?
                this.state.loading ?
                    <div className="p-2">Loading data...</div>
                    :
                    <div className="overflow-x-auto">
                        <div className="flex flex-row p-2 ">
                            <div className="flex flex-grow m-1 text-xl items-center">
                                <div className="flex"><span className="font-semibold">{proj.title}  </span></div>
                                <ContextMenu icon="more_horiz">
                                    <div className="rounded bg-white shadow-md  absolute mt-8 top-0 right-0 min-w-full text-xs" >
                                        <ul className="list-reset">
                                            <li><Button noborder title="Export CSV" handleOnClick={() => this.download("storymap.csv", this.projectCSV())} /></li>
                                            <li><Button noborder title="Export Wiki" handleOnClick={() => this.download(`${proj.title.replace(/ /g, '_')}.txt`, this.projectWiki())} /></li>
                                            <li><Button noborder title="Export AsciiDoc" handleOnClick={() => this.download(`${proj.title.replace(/ /g, '_')}.txt`, this.projectAsciiDoc())} /></li>
                                            <li><Button noborder title="Export Markdown" handleOnClick={() => this.download(`${proj.title.replace(/ /g, '_')}.txt`, this.projectMarkdown())} /></li>
                                            <li><Button noborder title="Export StoryMap(Wiki)" handleOnClick={() => this.download(`${proj.title.replace(/ /g, '_')}.txt`, this.storyMapWiki())} /></li>
                                            <li><Button noborder title="Export Project(JSON)" handleOnClick={() => this.download(`${proj.title.replace(/ /g, '_')}.txt`, this.projectJSON())} /></li>
                                        </ul>
                                    </div>
                                </ContextMenu>
                                {viewOnly && <div className="flex ml-2"><span className="font-semibold p-1 bg-gray-200 text-xs "> VIEW ONLY  </span></div>}
                            </div>
                            <div className="flex items-center">
                                <div className=" flex items-center  text-sm">


                                    {showPrivateLink &&
                                        <div >

                                            <div className="flex items-center flex-grow">
                                                <div className="flex flex-grow mr-1 " ><Link target="_blank" className="link" to={"/link/" + proj.externalLink}>Share link </Link></div>
                                                <div>
                                                    {document.queryCommandSupported('copy') && <button onClick={() => this.copyToClipboard(process.env.REACT_APP_BASE_URL + "/link/" + proj.externalLink)}><i style={{ fontSize: "16px" }} className="material-icons text-gray-800">file_copy</i></button>}
                                                </div>
                                                <div >
                                                    <i style={{ fontSize: "16px" }} className={"material-icons  text-green-500" + (!this.state.copySuccess ? " invisible" : "")}>check_circle</i>
                                                </div>
                                            </div>

                                        </div>
                                    }

                                    <div >
                                        <Button title="Personas" icon="person_outline" noborder handleOnClick={() => this.setState({ showPersonas: true })} />
                                    </div>

                                    <div className="">
                                        {this.state.showClosedMilstones ?
                                            <Button iconColor="text-green-500" noborder icon="toggle_on" title="Show closed" handleOnClick={() => this.setState({ showClosedMilstones: false })} />
                                            :
                                            <Button icon="toggle_off " noborder title="Show closed" handleOnClick={() => this.setState({ showClosedMilstones: true })} />
                                        }
                                    </div>

                                </div>
                                <div className="ml-4"><Link to={this.props.match.url + "/p/" + this.props.match.params.projectId}><i className="material-icons text-gray-600">settings</i></Link></div>
                            </div>
                        </div>

                        <Board
                            showClosed={this.state.showClosedMilstones}
                            viewOnly={viewOnly}
                            url={this.props.match.url}
                            features={this.props.features}
                            workflows={filterWorkflowsOnProject(this.props.workflows, projectId)}
                            subWorkflows={this.props.subWorkflows}
                            milestones={filterMilestonesOnProject(this.props.milestones, projectId)}
                            projectId={projectId}
                            workspaceId={ws.id}
                            demo={this.state.demo}
                            comments={filterFeatureCommentsOnProject(this.props.featureComments, projectId)}
                            personas={filterPersonasOnProject(this.props.personas, projectId)}
                            workflowPersonas={filterWorkflowPersonasOnProject(this.props.workflowPersonas, projectId)}

                            showPersonas={this.state.showPersonas}
                            closePersonas={() => this.setState({ showPersonas: false })}
                            openPersonas={() => this.setState({ showPersonas: true })}
                        />


                        <Switch>
                            <Route exact path="/" component={() => null} />
                            <Route exact path={this.props.match.path + "/m/:milestoneId"} component={EntityDetailsPage} />
                            <Route exact path={this.props.match.path + "/sw/:subWorkflowId"} component={EntityDetailsPage} />
                            <Route exact path={this.props.match.path + "/f/:featureId"} component={EntityDetailsPage} />
                            <Route exact path={this.props.match.path + "/w/:workflowId"} component={EntityDetailsPage} />
                            <Route exact path={this.props.match.path + "/p/:projectId2"} component={EntityDetailsPage} />

                        </Switch>
                    </div>
                : <div>Project not found</div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPage)