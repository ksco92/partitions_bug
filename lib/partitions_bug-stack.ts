import * as cdk from 'aws-cdk-lib';
import {RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Key} from "aws-cdk-lib/aws-kms";
import {CfnDataCatalogEncryptionSettings} from "aws-cdk-lib/aws-glue";
import {Database, DataFormat, S3Table, Schema} from "@aws-cdk/aws-glue-alpha";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PartitionsBugStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const catalogKey = new Key(this, 'CatalogKey', {
            enableKeyRotation: true,
            removalPolicy: RemovalPolicy.DESTROY,
        })

        new CfnDataCatalogEncryptionSettings(this, 'CatalogEncryption', {
            dataCatalogEncryptionSettings: {
                encryptionAtRest: {
                    catalogEncryptionMode: 'SSE-KMS',
                    sseAwsKmsKeyId: catalogKey.keyId,
                },
            },
            catalogId: this.account,
        });

        const database = new Database(this, 'Database', {
            databaseName: 'testdb'
        });

        new S3Table(this, 'MyTable', {
            database: database,
            columns: [
                {
                    name: 'col1',
                    type: Schema.STRING,
                },
            ],
            partitionKeys: [
                {
                    name: 'year',
                    type: Schema.SMALL_INT,
                },
            ],
            dataFormat: DataFormat.JSON,
            enablePartitionFiltering: true,
            partitionIndexes: [
                {
                    indexName: 'test',
                    keyNames: [
                        'year',
                    ],

                },
            ],
        });
    }
}
