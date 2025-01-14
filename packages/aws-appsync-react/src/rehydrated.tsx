/*!
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from 'react';
import * as PropTypes from 'prop-types';

import AWSAppSyncClient from 'aws-appsync';
import { RehydratedState } from './index';

export interface RehydrateProps {
    rehydrated: boolean;
    children: React.ReactNode,
}

const Rehydrate = (props: RehydrateProps) => (
    <div className={`awsappsync ${props.rehydrated ? 'awsappsync--rehydrated' : 'awsappsync--rehydrating'}`}>
        {props.rehydrated ? props.children : <span>Loading...</span>}
    </div>
);

export interface RehydratedProps {
    render?: ((props: { rehydrated: boolean }) => React.ReactNode);
    children?: React.ReactNode;
    loading?: React.ComponentType<any>;
}

export default class Rehydrated extends React.Component<RehydratedProps, RehydratedState> {
    static contextTypes = {
        client: PropTypes.instanceOf(AWSAppSyncClient).isRequired,
    };

    static propTypes = {
        render: PropTypes.func,
        children: PropTypes.node,
        loading: PropTypes.node,
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            rehydrated: false
        };
    }

    async componentWillMount() {
        await this.context.client.hydrated();

        this.setState({
            rehydrated: true
        });
    }

    render() {
        const { render, children, loading } = this.props;
        const { rehydrated } = this.state;

        if (render) return render({ rehydrated });

        if (children) {
            if (loading !== undefined) return rehydrated ? children : loading;

            return (
                <Rehydrate rehydrated={rehydrated}>
                    {children}
                </Rehydrate>
            );
        }
    }
}
