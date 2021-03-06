import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import * as batch from '../lib/';

export const app = new cdk.App();

const stack = new cdk.Stack(app, 'batch-stack');

const vpc = new ec2.Vpc(stack, 'vpc');

new batch.JobQueue(stack, 'batch-job-queue', {
  computeEnvironments: [
    {
      computeEnvironment: new batch.ComputeEnvironment(stack, 'batch-managed-compute-env'),
      order: 1,
    },
    {
      computeEnvironment: new batch.ComputeEnvironment(stack, 'batch-demand-compute-env', {
        managed: false,
        computeResources: {
          type: batch.ComputeResourceType.ON_DEMAND,
          vpc,
        },
      }),
      order: 2,
    },
    {
      computeEnvironment: new batch.ComputeEnvironment(stack, 'batch-spot-compute-env', {
        managed: false,
        computeResources: {
          type: batch.ComputeResourceType.SPOT,
          vpc,
          bidPercentage: 80,
        },
      }),
      order: 3,
    },
  ]
});

const repo = new ecr.Repository(stack, 'batch-job-repo');

new batch.JobDefinition(stack, 'batch-job-def-from-ecr', {
  container: {
    image: new ecs.EcrImage(repo, 'latest'),
  },
});

new batch.JobDefinition(stack, 'batch-job-def-from-', {
  container: {
    image: ecs.ContainerImage.fromRegistry('docker/whalesay'),
  },
});
