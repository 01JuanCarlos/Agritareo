from reportbro import Report, ReportBroError
import sys
import os
import json


def main():
    tempDirectory = sys.argv[1]
    fileName = sys.argv[2]
    isProduction = False

    if 'APP_ENV' in os.environ:
    		isProduction = os.environ['APP_ENV'] == "production" or os.environ['APP_ENV'] == "prod"
    filePrefix = "dev"

    if isProduction:
        filePrefix = "prod"

    with open('config.'+filePrefix+'.json') as config_file:
        config = json.load(config_file)

    tempPdfDirectory = os.path.join(tempDirectory, config['tmpPdfDir'])
    fileTempPath = os.path.join(tempDirectory, fileName + ".tmp")
    filePdfPath = os.path.join(tempPdfDirectory, fileName + ".pdf")

    data = open(fileTempPath, encoding="utf-8").read()
    #ndata = data.encode('utf-8')
    #json_data = json.loads(ndata.decode('utf8'))
    json_data = json.loads(data)

    report_definition = json_data.get('report')
    output_format = json_data.get('outputFormat')
    if output_format not in ('pdf', 'xlsx'):
        print('outputFormat parameter missing or invalid')
    data = json_data.get('data')
    is_test_data = bool(json_data.get('isTestData'))

    try:
        report = Report(report_definition, data, is_test_data)
        if report.errors:
            print("fail", dict(errors=report.errors))
        try:
            report_file = report.generate_pdf()
            if (not os.path.isdir(tempPdfDirectory)):
                os.mkdir(tempPdfDirectory)
            nf = open(filePdfPath, mode="w+b")
            nf.write(report_file)
            nf.close()
        except ReportBroError:
            print("fail", dict(errors=report.errors), report.errors)

    except Exception as e:
        print('failed to initialize report: ' + str(e))

main()
