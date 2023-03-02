> This repository has been replaced with [ffc-pay-batch-verifier](https://github.com/DEFRA/ffc-pay-batch-verifier)

# FFC Pay Batch Validator
Azure Function to validate integrity of payment batch files before downstream processing.

This function is triggered from a new file written to Azure Blob Storage matching a specific file mask.

The file must be written to a `batch` container, a virtual directory named `inbound` and must match the file mask of a payment batch's control file, `batch/inbound/CTL_PENDING_{name}.dat`.

Once the file is received the function will ensure all related required files are also present before then validating the `sha256` hash in the checksum file against the batch content.

## Required files
- payment batch file, `PENDING_{name}.dat`
- control file, `CTL_PENDING_{name}.dat`
- checksum file, `PENDING_{name}.txt`
- checksum control file, `CTL_PENDING_{name}.txt`

On successful validation, `PENDING_` is dropped from all filenames and all but the payment batch file are moved to the `archive` virtual directory.

## Prerequisites

- Node.js LTS 16+
- access to an Azure blob storage account (see options below)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Clinux%2Ccsharp%2Cportal%2Cbash)

## Azure Storage

To support local development of Azure blob storage, there are several options:

1. Use the Docker Compose file in this repository (recommended).

Running the below command will run an Azurite container.

`docker-compose up -d`

2. Install Azurite locally

See [Microsoft's guide](https://docs.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio) for information.

3. Use Azure cloud hosted storage

If any option other than `1` is taken, then the connection strings in `local.settings.json` will need to be updated.

## Configuration

The `local.settings.json` is used to hold all local development environment values.  This file assumes option `1` above is taken and therefore contains no sensitive values and can be committed to source control.

```
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10004/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10005/devstoreaccount1;",
    "BATCH_STORAGE": "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10004/devstoreaccount1;"
  }
}
```
> Note: if you wish to run this service end to end with [Payment Batch Processor](https://github.com/DEFRA/ffc-pay-batch-processor), then update the `BATCH_STORAGE` environment variable to use port `10000` instead of `10004`.

## Running the application

Use the convenience script, `./scripts/start`

### Running tests

```
# Run all tests
./scripts/test

# Run tests with file watch
./scripts/test -w
```

## CI pipeline

This service uses the [FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
