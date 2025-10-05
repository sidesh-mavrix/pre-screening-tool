import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Respondent, RespondentDocument, RespondentStatus } from './schemas/respondent.schema';
import { CreateRespondentDto } from './dto/create-respondent.dto';
import { UpdateRespondentDto } from './dto/update-respondent.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class RespondentsService {
  constructor(
    @InjectModel(Respondent.name) private respondentModel: Model<RespondentDocument>,
    private projectsService: ProjectsService,
  ) {}

  async createPublic(createDto: CreateRespondentDto): Promise<Respondent> {
    const project = await this.projectsService.findOneByProjectCode(createDto.projectCode);
    if (!project?.isEnabled) {
      throw new NotFoundException(`Active project "${createDto.projectCode}" not found`);
    }

    const existing = await this.respondentModel.findOne({
      projectId: project._id,
      respondentCode: createDto.respondentCode,
    });

    if (existing) {
      if (existing.status === RespondentStatus.COMPLETED) {
        throw new ConflictException('Survey already completed');
      }
      if (existing.status === RespondentStatus.TERMINATED) {
        throw new ConflictException('Survey already terminated');
      }
      return existing; // Return existing in-progress respondent
    }

    const respondent = new this.respondentModel({
      ...createDto,
      projectId: project._id,
      status: RespondentStatus.IN_PROGRESS,
      startTime: new Date(),
    });

    return respondent.save();
  }

  async findAll(projectId?: string): Promise<Respondent[]> {
    const query = projectId ? { projectId: new Types.ObjectId(projectId) } : {};
    return this.respondentModel.find(query).exec();
  }

  async findOne(id: string): Promise<Respondent> {
    const respondent = await this.respondentModel.findById(id).exec();
    if (!respondent) {
      throw new NotFoundException(`Respondent "${id}" not found`);
    }
    return respondent;
  }

  async updatePublic(projectCode: string, respondentCode: string, updateDto: UpdateRespondentDto): Promise<Respondent> {
    console.log(`\n=== UPDATING RESPONDENT ===`);
    console.log(`Project: ${projectCode}, Respondent: ${respondentCode}`);
    console.log(`Update payload:`, JSON.stringify(updateDto, null, 2));
    
    const respondent = await this.respondentModel.findOne({
      projectCode,
      respondentCode
    });

    if (!respondent) {
      console.log(`❌ Respondent not found: ${projectCode}/${respondentCode}`);
      throw new NotFoundException(`Respondent "${respondentCode}" not found for project "${projectCode}"`);
    }

    console.log(`✅ Found respondent ID:`, (respondent._id as any).toString());
    console.log(`📊 Current responses count:`, respondent.responses?.length || 0);
    
    const updateData: any = {};
    
    // Handle responses - direct replacement for final submission, merge for individual responses
    if (updateDto.responses && Array.isArray(updateDto.responses) && updateDto.responses.length > 0) {
      console.log(`📝 Processing ${updateDto.responses.length} new responses`);
      
      if (updateDto.status === 'completed' || updateDto.status === 'terminated') {
        // Final submission - use all responses
        updateData.responses = updateDto.responses.filter(res => {
          const hasValidQid = res.qid && res.qid.trim() !== '';
          const hasValidAnswer = res.answer !== undefined && res.answer !== null && 
            (Array.isArray(res.answer) ? res.answer.length > 0 : res.answer !== '');
          console.log(`Checking response ${res.qid}: hasValidQid=${hasValidQid}, hasValidAnswer=${hasValidAnswer}, answer=`, res.answer);
          return hasValidQid && hasValidAnswer;
        });
        console.log(`🏁 Final submission - storing ${updateData.responses.length} responses`);
      } else {
        // Individual response - merge with existing
        const currentResponses = respondent.responses || [];
        const updatedResponses = [...currentResponses];
        
        updateDto.responses.forEach((newRes, index) => {
          console.log(`Processing response ${index + 1}:`, newRes);
          
          const hasValidAnswer = newRes.answer !== undefined && newRes.answer !== null && 
            (Array.isArray(newRes.answer) ? newRes.answer.length > 0 : newRes.answer !== '');
          
          if (newRes.qid && hasValidAnswer) {
            const existingIndex = updatedResponses.findIndex(r => r.qid === newRes.qid);
            const responseData = {
              qid: newRes.qid,
              answer: newRes.answer,
              otherTextValue: newRes.otherTextValue || undefined
            };
            
            if (existingIndex > -1) {
              updatedResponses[existingIndex] = responseData;
              console.log(`🔄 Updated existing response for ${newRes.qid}`);
            } else {
              updatedResponses.push(responseData);
              console.log(`➕ Added new response for ${newRes.qid}`);
            }
          }
        });
        
        updateData.responses = updatedResponses;
      }
      
      console.log(`📊 Final responses to store:`, updateData.responses.length);
      console.log(`📋 Response data:`, JSON.stringify(updateData.responses, null, 2));
    }
    
    // Handle other fields
    if (updateDto.status) updateData.status = updateDto.status;
    if (updateDto.terminationReason) updateData.terminationReason = updateDto.terminationReason;
    if (updateDto.terminatedAtQuestion) updateData.terminatedAtQuestion = updateDto.terminatedAtQuestion;
    if (updateDto.completionTimeSec) updateData.completionTimeSec = updateDto.completionTimeSec;
    if (updateDto.endTime) updateData.endTime = updateDto.endTime;

    console.log(`🔄 Updating with data:`, JSON.stringify(updateData, null, 2));

    const updatedRespondent = await this.respondentModel.findOneAndUpdate(
      { projectCode, respondentCode },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedRespondent) {
      console.log(`❌ Failed to update respondent`);
      throw new NotFoundException(`Failed to update respondent "${respondentCode}"`);
    }

    console.log(`✅ Successfully updated respondent`);
    console.log(`📊 Final stored responses count:`, updatedRespondent.responses?.length || 0);
    console.log(`=== UPDATE COMPLETE ===\n`);
    
    return updatedRespondent;
  }

  async update(id: string, updateDto: UpdateRespondentDto): Promise<Respondent> {
    const respondent = await this.respondentModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true }
    );

    if (!respondent) {
      throw new NotFoundException(`Respondent "${id}" not found`);
    }

    return respondent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.respondentModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Respondent "${id}" not found`);
    }
  }

  async exportData(projectId: string, status?: string): Promise<any[]> {
    const query: any = { projectId: new Types.ObjectId(projectId) };
    if (status && status !== 'all') {
      query.status = status;
    }

    const respondents = await this.respondentModel.find(query).exec();
    
    // Get all unique question IDs
    const allQuestionIds = new Set<string>();
    respondents.forEach(respondent => {
      if (respondent.responses) {
        respondent.responses.forEach(response => {
          allQuestionIds.add(response.qid);
        });
      }
    });
    
    // Transform data for export
    const exportData = respondents.map(respondent => {
      const baseData: any = {
        'Respondent Code': respondent.respondentCode,
        'Project Code': respondent.projectCode,
        'Country Code': respondent.countryCode || '',
        'Language Code': respondent.languageCode || '',
        'Status': respondent.status,
        'Start Time': respondent.startTime,
        'End Time': respondent.endTime || '',
        'Completion Time (sec)': respondent.completionTimeSec || '',
        'Termination Reason': respondent.terminationReason || '',
        'Terminated At Question': respondent.terminatedAtQuestion || ''
      };

      // Initialize all question columns with empty values
      allQuestionIds.forEach(qid => {
        baseData[qid] = '';
      });

      // Add response data
      if (respondent.responses && respondent.responses.length > 0) {
        respondent.responses.forEach((response) => {
          const qid = response.qid;
          let answerValue = '';
          
          if (Array.isArray(response.answer)) {
            answerValue = response.answer.join('; ');
          } else {
            answerValue = String(response.answer);
          }
          
          baseData[qid] = answerValue;
          
          if (response.otherTextValue) {
            baseData[`${qid}_Other`] = response.otherTextValue;
          }
        });
      }

      return baseData;
    });

    return exportData;
  }

  async checkOEResponses(file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const XLSX = require('xlsx');
    const results: string[] = [];
    
    try {

      
      if (file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
        if (!file.buffer || file.buffer.length === 0) {
          throw new Error('Empty file buffer');
        }
        
        // Handle Excel files
        const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('No sheets found in Excel file');
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          throw new Error('Cannot read worksheet');
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        

        
        // Skip header row and get first column
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row && row.length > 0 && row[0] && String(row[0]).trim()) {
            results.push(String(row[0]).trim());
          }
        }
      } else {

        // Handle CSV files
        const csv = require('csv-parser');
        const { Readable } = require('stream');
        
        return new Promise((resolve, reject) => {
          const stream = Readable.from(file.buffer.toString());
          
          stream
            .pipe(csv({ headers: false }))
            .on('data', (data: any) => {
              const response = data['0'];
              if (response && response.trim()) {
                results.push(response.trim());
              }
            })
            .on('end', () => {
              const processedData = this.analyzeOEResponses(results);
              resolve(processedData);
            })
            .on('error', (error: any) => {
              reject(new BadRequestException('Error processing CSV file'));
            });
        });
      }
      

      const processedData = this.analyzeOEResponses(results);
      return processedData;
    } catch (error) {
      throw new BadRequestException(`Error processing file: ${error.message}`);
    }
  }

  private analyzeOEResponses(responses: string[]): any {
    const processedData: any[] = [];
    let botResponses = 0;
    let qualityIssues = 0;
    const flagsSummary: { [key: string]: number } = {};

    responses.forEach((response, index) => {
      const analysis = this.analyzeResponse(response);
      
      processedData.push({
        'Row': index + 2,
        'Original Response': response,
        'Bot Score': analysis.botScore,
        'Is Bot': analysis.botScore >= 70 ? 'YES' : 'NO',
        'Flags': analysis.flags.join(', '),
        'Bad Words': analysis.badWords ? 'YES' : 'NO',
        'Gibberish': analysis.isGibberish ? 'YES' : 'NO',
        'Entropy': analysis.entropy,
        'Repetitive': analysis.repetitive ? 'YES' : 'NO',
        'Excessive Caps': analysis.excessiveCaps ? 'YES' : 'NO',
        'Length Issue': analysis.lengthIssue ? 'YES' : 'NO',
        'Word Count': analysis.wordCount,
        'Character Count': response.length
      });

      if (analysis.botScore >= 70) botResponses++;
      if (analysis.flags.length > 0) qualityIssues++;
      
      // Count flags
      analysis.flags.forEach(flag => {
        flagsSummary[flag] = (flagsSummary[flag] || 0) + 1;
      });
    });

    const averageBotScore = Math.round(
      processedData.reduce((sum, item) => sum + item['Bot Score'], 0) / processedData.length
    );

    return {
      processedData,
      totalResponses: responses.length,
      botResponses,
      qualityIssues,
      averageBotScore,
      flagsSummary
    };
  }

  private analyzeResponse(response: string): any {
    const flags: string[] = [];
    let botScore = 0;
    
    // Basic checks
    const wordCount = response.split(/\s+/).length;
    const charCount = response.length;
    
    // Simple bad words check
    const badWords = [
      'fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'bastard', 'crap',
      'piss', 'screw', 'suck', 'stupid', 'idiot', 'moron', 'dumb',
      'spam', 'test', 'asdf', 'qwerty', 'aaaa', 'bbbb', 'cccc'
    ];
    const hasBadWords = badWords.some(word => 
      response.toLowerCase().includes(word.toLowerCase())
    );
    
    // Gibberish detection (simple pattern matching)
    const gibberishPatterns = [
      /[bcdfghjklmnpqrstvwxyz]{4,}/i, // Too many consonants
      /[aeiou]{4,}/i, // Too many vowels
      /(..)\1{2,}/i, // Repeated character pairs
      /^([a-z])\1{3,}$/i // Single character repeated
    ];
    const isGibberish = gibberishPatterns.some(pattern => pattern.test(response));
    
    // Simple language detection (check for common English words)
    const englishWords = ['the', 'and', 'is', 'was', 'are', 'were', 'a', 'an', 'to', 'of', 'in', 'for', 'with', 'on', 'at', 'by', 'from', 'as', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'good', 'bad', 'great', 'nice', 'love', 'like', 'hate', 'want', 'need', 'get', 'go', 'come', 'see', 'know', 'think', 'feel', 'look', 'work', 'make', 'take', 'give', 'use', 'find', 'tell', 'ask', 'try', 'help', 'show', 'play', 'run', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain'];
    const words = response.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    const isNonEnglish = words.length > 5 && englishWordCount / words.length < 0.3;
    
    // Entropy calculation
    const entropy = this.calculateEntropy(response);
    const isLowEntropy = entropy < 2.5;
    const isHighEntropy = entropy > 4.5;
    
    // Repetitive pattern check
    const uniqueWords = new Set(words);
    const repetitive = words.length > 3 && uniqueWords.size / words.length < 0.6;
    
    // Exact repetitions
    const hasExactRepetition = /\b(\w+)\s+\1\s+\1/i.test(response);
    
    // Excessive capitalization
    const capsCount = (response.match(/[A-Z]/g) || []).length;
    const excessiveCaps = capsCount > response.length * 0.5 && response.length > 10;
    
    // Length issues
    const lengthIssue = wordCount < 3 || wordCount > 200;
    
    // Calculate bot score
    if (hasBadWords) { botScore += 25; flags.push('Bad Words'); }
    if (isGibberish) { botScore += 40; flags.push('Gibberish'); }
    if (isLowEntropy) { botScore += 35; flags.push('Low Entropy'); }
    if (isHighEntropy) { botScore += 25; flags.push('High Entropy'); }
    if (repetitive) { botScore += 30; flags.push('Repetitive'); }
    if (hasExactRepetition) { botScore += 35; flags.push('Exact Repetition'); }
    if (excessiveCaps) { botScore += 20; flags.push('Excessive Caps'); }
    if (lengthIssue) { botScore += 15; flags.push('Length Issue'); }
    if (wordCount === 1) { botScore += 25; flags.push('Single Word'); }
    if (/^[a-zA-Z]$/.test(response.trim())) { botScore += 45; flags.push('Single Character'); }
    if (/^\d+$/.test(response.trim())) { botScore += 40; flags.push('Numbers Only'); }
    
    return {
      botScore: Math.min(botScore, 100),
      flags,
      badWords: hasBadWords,
      repetitive,
      excessiveCaps,
      lengthIssue,
      wordCount,
      isGibberish,
      detectedLanguage: isNonEnglish ? 'non-eng' : 'eng',
      entropy: entropy.toFixed(2)
    };
  }
  
  private calculateEntropy(text: string): number {
    const freq = {};
    for (const char of text.toLowerCase()) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const length = text.length;
    
    for (const count of Object.values(freq)) {
      const p = (count as number) / length;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }
}