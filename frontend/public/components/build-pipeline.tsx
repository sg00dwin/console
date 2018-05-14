import * as React from 'react';
import * as _ from 'lodash-es';
import { Link } from 'react-router-dom';
import { resourcePath } from './utils';
import { fromNow } from './utils/datetime';
import { K8sResourceKind } from '../module/k8s';

const getBuildNumber = (resource: K8sResourceKind): number => _.get(resource, ['metadata', 'annotations', 'openshift.io/build.number']);
const getStages = (status): any[] => (status && status.stages) || [];
const getJenkinsStatus = (resource: K8sResourceKind) => {
  const status = _.get(resource, ['metadata', 'annotations', 'openshift.io/jenkins-status-json']);
  const json = _.attempt(JSON.parse(status));
  return _.isError(json) ? {} : json;
};
const getJenkinsLogURL = (resource: K8sResourceKind): string => _.get(resource, ['metadata', 'annotations', 'openshift.io/jenkins-log-url']);
const getJenkinsBuildURL = (resource: K8sResourceKind): string => _.get(resource, ['metadata', 'annotations', 'openshift.io/jenkins-build-uri']);

const BuildSummaryStatusIcon: React.SFC<BuildSummaryStatusIconProps> = ({status}) => {
  const statusClass = _.lowerCase(status);
  const icon = ({
    new: 'fa-hourglass-o',
    pending: 'fa-hourglass-half',
    running: 'fa-refresh fa-spin',
    complete: 'fa-check-circle',
    failed: 'fa-times-circle'
  })[statusClass];
  const hide = icon ? 'hide' : '';
  return <React.Fragment>
    <span className={`build-pipeline__status-icon build-pipeline__status-icon--${statusClass}`}>
      <span aria-hidden="true">
        <span className={`fa ${icon} fa-fw`}></span>
      </span>
    </span>

    <span className={`build-pipeline__status-icon ${hide}`}>
      <span className="fa fa-refresh fa-spin" aria-hidden="true"></span>
    </span>
  </React.Fragment>;
};

const BuildLogLink: React.SFC<BuildLogLinkProps> = ({obj}) => {
  const link = getJenkinsLogURL(obj);
  return link ? <div className="build-pipeline__link">
    <a href={link} target="_blank" rel="noopener noreferrer">View Log</a>
  </div> : null;
};

const StagesNotStarted: React.SFC<StagesNotStartedProps> = ({stages}) => {
  return !stages.length ? <div className="build-pipeline__stage build-pipeline__stage--none">
    <div className="build-pipeline__stage-name">No stages have started.</div>
  </div> : null;
};


const BuildSummaryTimestamp: React.SFC<BuildSummaryTimestampProps> = ({timestamp}) => <span className="build-pipeline__timestamp text-muted">
  { fromNow(timestamp) }
</span>;

const BuildPipelineSummary: React.SFC<BuildPipelineSummaryProps> = ({obj}) => {
  const { name, namespace } = obj.metadata;
  const buildNumber = getBuildNumber(obj);
  const path: string = resourcePath(obj.kind, name, namespace);
  return <div className="build-pipeline__summary">
    <div className="build-pipeline__phase">
      <BuildSummaryStatusIcon status={obj.status.phase} /> <Link to={path} title={name}>Build {buildNumber}</Link>
    </div>
    <BuildSummaryTimestamp timestamp={obj.metadata.creationTimestamp} />
    <BuildLogLink obj={obj} />
  </div>;
};

const BuildAnimation:React.SFC<BuildAnimationProps> = ({status}) => <div className={`build-pipeline__status-bar build-pipeline__status-bar--${_.kebabCase(status)}`}>
  <div className="build-pipeline__animation-line"></div>
  <div className="build-pipeline__animation-circle">
    <div className="build-pipeline__circle-clip1"></div>
    <div className="build-pipeline__circle-clip2"></div>
    <div className="build-pipeline__circle-inner">
      <div className="build-pipeline__circle-inner-fill"></div>
    </div>
  </div>
</div>;

const JenkinsInputUrl: React.SFC<JenkinsInputUrlProps> = ({obj, stage}) => {
  const pending = stage && (stage.status === 'PAUSED_PENDING_INPUT');
  const buildUrl = getJenkinsBuildURL(obj);
  if(pending) {
    return <div className="build-pipeline__stage-actions text-muted">
      <a href={buildUrl} target="_blank" rel="noopener noreferrer">Input Required</a>
    </div>;
  }
  return null;
};

const BuildStageTimestamp:React.SFC<BuildStageTimestampProps> = ({timestamp}) => <div className="build-pipeline__stage-time text-muted">
  { fromNow(timestamp) }
</div>;

const BuildStageName: React.SFC<BuildStageNameProps> = ({name}) => {
  return <div title={name} className="build-pipeline__stage-name">
    {name}
  </div>;
};

const BuildStage: React.SFC<BuildStageProps> = ({obj, stage}) => {
  return <div className="build-pipeline__stage">
    <div className="build-pipeline__stage-column">
      <BuildStageName name={stage.name} />
      <BuildAnimation status={stage.status} />
      <JenkinsInputUrl obj={obj} stage={stage} />
      <BuildStageTimestamp timestamp={stage.startTimeMillis} />
    </div>
  </div>;
};

export const BuildPipeline: React.SFC<BuildPipelineProps> = ({obj}) => {
  const jenkinsStatus: any = getJenkinsStatus(obj);
  const stages = getStages(jenkinsStatus);
  return <div className="build-pipeline">
    <BuildPipelineSummary obj={obj} />
    <div className="build-pipeline__container">
      <div className="build-pipeline__stages">
        <StagesNotStarted stages={stages} />
        { stages.map((stage => <BuildStage obj={obj} stage={stage} key={stage.id} /> )) }
      </div>
    </div>
  </div>;
};

/* eslint-disable no-undef */
export type BuildPipelineProps = {
  obj: K8sResourceKind,
};

export type BuildStageProps = {
  obj: K8sResourceKind,
  stage: any,
};

export type BuildAnimationProps = {
  status: string,
};

export type BuildPipelineSummaryProps = {
  obj: K8sResourceKind,
};

export type BuildSummaryStatusIconProps = {
  status: string,
};

export type BuildStageTimestampProps = {
  timestamp: string,
};

export type BuildLogLinkProps = {
  obj: K8sResourceKind,
};

export type BuildSummaryTimestampProps = {
  timestamp: string,
};

export type BuildStageNameProps = {
  name: string,
};

export type JenkinsInputUrlProps = {
  obj: K8sResourceKind,
  stage: any,
};

export type StagesNotStartedProps = {
  stages: any,
};
/* eslint-disable no-undef */
